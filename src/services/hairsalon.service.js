import HairService from "../models/HairService.model.js";
import Category from "../models/Category.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { normalizeTags } from "../utils/normalizeTags.js";
import { applyServiceDiscount } from "../utils/applyServiceDiscount.js";
import {
  calculateServiceDiscount,
  calculateConversionRate,
  calculatePopularityScore,
  calculateFeatured,
  calculatePriority
} from "../domains/hairService/hairServiceCalculator.js";
import { makeSlug } from "../utils/slug.js";
import crypto from "crypto";



const getHairServiceById = async (serviceId) => {
  const service = await HairService.findById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  HairService.updateOne(
    { _id: serviceId },
    { $inc: { viewCount: 1 } }
  ).exec();

  return applyServiceDiscount(service);
};



const getHairServices = async (filters = {}) => {
  const query = {
    isDeleted: false,
    isActive: true
  };

  /* ================= CATEGORY FILTER ================= */
  if (filters.category) {
    await validateCategory(filters.category);
    query.category = filters.category;
  }

  const services = await HairService.find(query)
    .populate("category", "name")
    .sort({ priority: -1, popularityScore: -1 });

  return services.map(applyServiceDiscount);
};


/**
 * Validate category exists and is active
 * @param {String} categoryName - Category name
 * @returns {Promise<Object>} Category object
 */
const validateCategory = async (categoryId) => {
  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Danh mục "${categoryId}" không tồn tại hoặc không hoạt động`
    );
  }

  return category;
};


const createHairService = async (payload) => {

  /* ================= CATEGORY VALIDATION ================= */
  if (!payload.category) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Danh mục (category) là bắt buộc"
    );
  }

  await validateCategory(payload.category);

  /* ================= SLUG ================= */
  payload.slug = payload.slug
    ? makeSlug(payload.slug)
    : makeSlug(payload.name || crypto.randomBytes(6).toString("hex"));

  let slugCandidate = payload.slug;
  while (await HairService.findOne({ slug: slugCandidate })) {
    slugCandidate = `${payload.slug}-${crypto.randomBytes(3).toString("hex")}`;
  }
  payload.slug = slugCandidate;

  /* ================= TAGS ================= */
  if (payload.tags) {
    payload.tags = normalizeTags(
      typeof payload.tags === "string"
        ? JSON.parse(payload.tags)
        : payload.tags
    );
  }

  /* ================= IMAGES ================= */
  if (!Array.isArray(payload.images)) {
    payload.images = [];
  }

  /* ================= COMBO VALIDATION ================= */
  if (payload.isCombo) {
    if (
      !Array.isArray(payload.includedServices) ||
      payload.includedServices.length < 2
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Combo phải có ít nhất 2 dịch vụ"
      );
    }

    // ❌ combo không có price, duration riêng
    delete payload.price;
    delete payload.duration;
  } else {
    // ❌ service đơn không được có includedServices
    payload.includedServices = [];
  }

  /* ================= PRICE CALC ================= */
  const discountResult = await calculateServiceDiscount(payload);

  payload.finalPrice = discountResult.finalPrice;
  payload.serviceDiscount = {
    ...payload.serviceDiscount,
    isActive: discountResult.isActive
  };

  return await HairService.create(payload);
};



const updateHairService = async (serviceId, payload) => {
  const service = await HairService.findById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  /* ================= CATEGORY VALIDATION ================= */
  if (payload.category && payload.category !== service.category) {
    await validateCategory(payload.category);
  }

  /* ================= SLUG ================= */
  if (payload.slug && payload.slug !== service.slug) {
    const newSlug = makeSlug(payload.slug);

    const existing = await HairService.findOne({
      slug: newSlug,
      _id: { $ne: serviceId }
    });

    if (existing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Service with this slug already exists"
      );
    }

    payload.slug = newSlug;
  }

  /* ================= TAGS ================= */
  if ("tags" in payload) {
    service.tags = normalizeTags(payload.tags);
    delete payload.tags;
  }

  /* ================= COMBO RULE ================= */
  if (payload.isCombo) {
    if (
      !Array.isArray(payload.includedServices) ||
      payload.includedServices.length < 2
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Combo phải có ít nhất 2 dịch vụ"
      );
    }

    delete payload.price;
    delete payload.duration;
  } else {
    payload.includedServices = [];
  }

  Object.assign(service, payload);

  /* ================= RECALC ================= */
  const discountResult = await calculateServiceDiscount(service);

  service.finalPrice = discountResult.finalPrice;
  service.serviceDiscount.isActive = discountResult.isActive;

  service.conversionRate = calculateConversionRate(service);
  service.popularityScore = calculatePopularityScore(service);
  service.isFeatured = calculateFeatured(service);
  service.priority = calculatePriority(service);

  return await service.save();
};

const deleteHairService = async (serviceId) => {
  const service = await HairService.findById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  service.isDeleted = true;
  return await service.save();
};

export const HairSalonService = {
  createHairService,
  updateHairService,
  deleteHairService,
  getHairServices,
  getHairServiceById,
  validateCategory,
};
