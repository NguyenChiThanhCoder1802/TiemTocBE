import HairService from "../models/HairService.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { normalizeTags } from "../utils/normalizeTags.js";
import crypto from "crypto";


const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const getHairServiceById = async (serviceId) => {
  const service = await HairService.findById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found');
  }
  HairService.updateOne(
    { _id: serviceId },
    { $inc: { viewCount: 1 } }
  ).exec();
  return service;
};
const getHairServices = async (filters = {}) => {
  const query = { isDeleted: false, ...filters };
  return await HairService.find(query).sort({ priority: -1, popularityScore: -1 });
};
const createHairService = async (payload) => {
  // Generate slug from name if not provided
  if (!payload.slug && payload.name) {
    payload.slug = slugify(payload.name);
  } else if (payload.slug) {
    payload.slug = slugify(payload.slug);
  }

  let slugCandidate =
    payload.slug ||
    slugify(payload.name || crypto.randomBytes(6).toString("hex"));

  while (await HairService.findOne({ slug: slugCandidate })) {
    slugCandidate = `${payload.slug}-${crypto
      .randomBytes(3)
      .toString("hex")}`;
  }

  payload.slug = slugCandidate;
  if (payload.tags) {
    payload.tags = normalizeTags(
      typeof payload.tags === "string"
        ? JSON.parse(payload.tags)
        : payload.tags
    );
  }
  // Handle images/videos upload: accept base64 data URIs or URLs
  if (!Array.isArray(payload.images)) {
    payload.images = [];
  }

  return await HairService.create(payload);

};
const updateHairService = async (serviceId, payload) => {
  const service = await HairService.findById(serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  // slug check
  if (payload.slug && payload.slug !== service.slug) {
    const existingService = await HairService.findOne({ slug: payload.slug });
    if (existingService) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Service with this slug already exists"
      );
    }
  }

  // ✅ TAGS: overwrite hoàn toàn
  if ("tags" in payload) {
    service.tags = normalizeTags(payload.tags);
    delete payload.tags;
  }

  Object.assign(service, payload);
  return await service.save();
};

const deleteHairService = async (serviceId) => {
  const service = await HairService.findById(serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found');
  }
  service.isDeleted = true;
  return await service.save();
}
const getServiceStatistics = async () => {
  const [
    totalServices,
    topBooking,
    topView,
    topConversion,
    inactiveServices
  ] = await Promise.all([
    HairService.countDocuments({ isDeleted: false }),

    HairService.find({ isDeleted: false })
      .sort({ bookingCount: -1 })
      .limit(5)
      .select('name bookingCount price'),

    HairService.find({ isDeleted: false })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('name viewCount'),

    HairService.find({ isDeleted: false })
      .sort({ conversionRate: -1 })
      .limit(5)
      .select('name conversionRate'),

    HairService.find({
      isDeleted: false,
      bookingCount: 0,
      viewCount: { $gt: 20 }
    }).select('name viewCount bookingCount')
  ])

  return {
    totalServices,
    topBooking,
    topView,
    topConversion,
    inactiveServices
  }
}

export const HairSalonService = {
  createHairService,
  updateHairService,
  deleteHairService,
  getHairServices,
  getHairServiceById,
  getServiceStatistics
};