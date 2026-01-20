import mongoose from "mongoose";
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
  calculatePriority,
} from "../domains/hairService/hairServiceCalculator.js";
import { makeSlug } from "../utils/slug.js";
import crypto from "crypto";

/* ================= CATEGORY VALIDATION ================= */
const validateCategory = async (category) => {
  const categoryId =
    typeof category === "object" ? category._id : category;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category không hợp lệ");
  }

  const found = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!found) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Danh mục không tồn tại hoặc không hoạt động"
    );
  }

  return found;
};

/* ================= GET ================= */
const getHairServiceById = async (serviceId) => {
  const service = await HairService.findById(serviceId)
    .populate("category", "name")
    .populate("includedServices", "name finalPrice");

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
  const query = { isDeleted: false, isActive: true };

  if (filters.category) {
    const cat = await validateCategory(filters.category);
    query.category = cat._id;
  }

  const services = await HairService.find(query)
    .populate("category", "name")
    .sort({ priority: -1, popularityScore: -1 });

  return services.map(applyServiceDiscount);
};

/* ================= CREATE ================= */
const createHairService = async (payload) => {
  const category = await validateCategory(payload.category);
  payload.category = category._id;

  payload.slug = payload.slug
    ? makeSlug(payload.slug)
    : makeSlug(payload.name || crypto.randomBytes(6).toString("hex"));

  let slugCandidate = payload.slug;
  while (await HairService.findOne({ slug: slugCandidate })) {
    slugCandidate = `${payload.slug}-${crypto.randomBytes(3).toString("hex")}`;
  }
  payload.slug = slugCandidate;

  if (payload.tags) {
    payload.tags = normalizeTags(
      typeof payload.tags === "string"
        ? JSON.parse(payload.tags)
        : payload.tags
    );
  }

  if (!Array.isArray(payload.images)) payload.images = [];

  /* ===== COMBO LOGIC ===== */
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

    if (!payload.combo?.comboPrice || !payload.combo?.endAt) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Combo phải có giá combo và ngày kết thúc"
      );
    }

    const services = await HairService.find({
      _id: { $in: payload.includedServices },
      isDeleted: false,
      isActive: true,
    });

    payload.combo.originalPrice = services.reduce(
      (sum, s) => sum + s.finalPrice,
      0
    );

    delete payload.price;
    delete payload.duration;
  } else {
    payload.includedServices = [];
    payload.combo = undefined;
  }

  const discountResult = await calculateServiceDiscount(payload);
  payload.finalPrice = discountResult.finalPrice;
  payload.serviceDiscount = {
    ...payload.serviceDiscount,
    isActive: discountResult.isActive,
  };

  return await HairService.create(payload);
};

/* ================= UPDATE ================= */
const updateHairService = async (serviceId, payload) => {
  const service = await HairService.findById(serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  if (payload.category) {
    const cat = await validateCategory(payload.category);
    payload.category = cat._id;
  }

  if (payload.slug && payload.slug !== service.slug) {
    const newSlug = makeSlug(payload.slug);
    const exists = await HairService.findOne({
      slug: newSlug,
      _id: { $ne: serviceId },
    });
    if (exists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Service with this slug already exists"
      );
    }
    payload.slug = newSlug;
  }

  if ("tags" in payload) {
    service.tags = normalizeTags(payload.tags);
    delete payload.tags;
  }

  if (payload.isCombo) {
    if (
      payload.includedServices &&
      payload.includedServices.length < 2
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Combo phải có ít nhất 2 dịch vụ"
      );
    }

    if (payload.includedServices) {
      const services = await HairService.find({
        _id: { $in: payload.includedServices },
        isDeleted: false,
        isActive: true,
      });

      service.combo.originalPrice = services.reduce(
        (sum, s) => sum + s.finalPrice,
        0
      );
    }

    delete payload.price;
    delete payload.duration;
  } else {
    service.isCombo = false;
    service.includedServices = [];
    service.combo = undefined;
  }

  Object.assign(service, payload);

  const discountResult = await calculateServiceDiscount(service);
  service.finalPrice = discountResult.finalPrice;
  service.serviceDiscount.isActive = discountResult.isActive;

  service.conversionRate = calculateConversionRate(service);
  service.popularityScore = calculatePopularityScore(service);
  service.isFeatured = calculateFeatured(service);
  service.priority = calculatePriority(service);

  return await service.save();
};

/* ================= DELETE ================= */
const deleteHairService = async (serviceId) => {
  const service = await HairService.findById(serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  service.isDeleted = true;
  service.isActive = false;
  return await service.save();
};

export const HairSalonService = {
  createHairService,
  updateHairService,
  deleteHairService,
  getHairServices,
  getHairServiceById,
};
