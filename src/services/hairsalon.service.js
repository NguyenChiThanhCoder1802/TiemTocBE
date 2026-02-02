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
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service ID không hợp lệ");
  }

  const service = await HairService.findOne({
    _id: serviceId,
    isDeleted: false,
  })
    .populate("category", "name")
    .lean();

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  HairService.updateOne(
    { _id: serviceId },
    { $inc: { viewCount: 1 } }
  ).exec();

  return applyServiceDiscount(service);
};


const getHairServices = async (filters = {},pagination) => {
  const query = { isDeleted: false, isActive: true };

  if (filters.category) {
    const cat = await validateCategory(filters.category);
    query.category = cat._id;
  }
  if (filters.search) {
    query.name = {
      $regex: filters.search,
      $options: "i"
    }
  }
   if (filters.minPrice || filters.maxPrice) {
    query.finalPrice = {}
    if (filters.minPrice) query.finalPrice.$gte = Number(filters.minPrice)
    if (filters.maxPrice) query.finalPrice.$lte = Number(filters.maxPrice)
  }
 if (filters.discountOnly === true) {
    query["serviceDiscount.isActive"] = true
  }
  const sortMap = {
    priority: { priority: -1, popularityScore: -1 },
    newest: { createdAt: -1 },
    price_asc: { finalPrice: 1 },
    price_desc: { finalPrice: -1 },
    popular: { popularityScore: -1 }
  }
  const sortOption = sortMap[filters.sort] || sortMap.priority
  const { page, limit, skip } = pagination;
  const [services, totalItems] = await Promise.all([
      HairService.find(query)
        .populate("category", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      HairService.countDocuments(query)
    ]);

    return {
      data: services.map(applyServiceDiscount),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    };
};
//get limit latest hair services
const getLatestHairServices = async (limit = 5) => {
  const services = await HairService.find({
    isDeleted: false,
    isActive: true
  })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return services.map(applyServiceDiscount);
};
// get dịch vụ yêu thích nhất
const getMostFavoritedServices = async (limit = 10) => {
  const services = await HairService.find({
    isDeleted: false,
    isActive: true,
    favoriteCount: { $gt: 0 }
  })
    .sort({ favoriteCount: -1 })
    .limit(limit)
    .populate("category", "name")
    .lean();

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

  if ("images" in payload && !Array.isArray(payload.images)) {
    delete payload.images;
  }
  if ("price" in payload) {
  payload.price = Number(payload.price);
}

  Object.assign(service, payload);

  const discountResult = await calculateServiceDiscount({
    price: service.price,
    serviceDiscount: service.serviceDiscount,
  });
  service.finalPrice = discountResult.finalPrice;
  if (service.serviceDiscount) {
    service.serviceDiscount.isActive = discountResult.isActive;
  }

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
  getLatestHairServices,
  getMostFavoritedServices
};
