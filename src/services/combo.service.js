import mongoose from "mongoose";
import crypto from "crypto";
import ComboService from "../models/ComboService.model.js";
import HairService from "../models/HairService.model.js"
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { makeSlug } from "../utils/slug.js";
import { normalizeTags } from "../utils/normalizeTags.js";
import { getComboCategoryId } from "../utils/getComboCategory.js";
/* ================= VALIDATE ID ================= */
const validateObjectId = (id, name = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `${name} không hợp lệ`);
  }
};

/* ================= GET BY ID ================= */
const getComboById = async (comboId) => {
  validateObjectId(comboId, "Combo ID");

  const combo = await ComboService.findOne({
    _id: comboId,
    isDeleted: false,
  })

  if (!combo) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Combo not found");
  }

  ComboService.updateOne(
    { _id: comboId },
    { $inc: { "stats.viewCount": 1 } }
  ).exec();

  return combo;
};
/* ================= GET BY SLUG ================= */
const getComboBySlug = async (slug) => {
  if (!slug) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Slug is required"
    );
  }

  const combo = await ComboService.findOne({
    slug,
    isDeleted: false,
    isActive: true,
  })
    .populate({
      path: "services.service",
      select: "name finalPrice duration",
    })
     .populate("category", "name")
    .lean();

  if (!combo) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Combo not found"
    );
  }

  // tăng view count (không block response)
  ComboService.updateOne(
    { _id: combo._id },
    { $inc: { "stats.viewCount": 1 } }
  ).exec();

  return combo;
};
/* ================= CREATE ================= */
const createCombo = async (payload) => {
  payload.category = await getComboCategoryId();
  /* ---------- SLUG ---------- */
  payload.slug = payload.slug
    ? makeSlug(payload.slug)
    : makeSlug(payload.name || crypto.randomBytes(6).toString("hex"));

  let slugCandidate = payload.slug;
  while (await ComboService.findOne({ slug: slugCandidate })) {
    slugCandidate = `${payload.slug}-${crypto
      .randomBytes(3)
      .toString("hex")}`;
  }
  payload.slug = slugCandidate;

  /* ---------- TAGS ---------- */
  if (payload.tags) {
    payload.tags = normalizeTags(
      typeof payload.tags === "string"
        ? JSON.parse(payload.tags)
        : payload.tags
    );
  }

 if (!Array.isArray(payload.services) || payload.services.length < 2) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Combo must contain at least 2 services"
    );
  }

  const enrichedServices = [];

  for (const item of payload.services) {
    const service = await HairService.findById(item.service);

    if (!service || service.isDeleted) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "HairService not found"
      );
    }

    enrichedServices.push({
      service: service._id,
      nameSnapshot: service.name,
      unitPriceSnapshot: service.price,
      durationSnapshot: service.duration,
    });
  }

  payload.services = enrichedServices;
  return await ComboService.create(payload);
};

/* ================= UPDATE ================= */
const updateCombo = async (comboId, payload) => {
  validateObjectId(comboId, "Combo ID");

  const combo = await ComboService.findById(comboId);
  if (!combo || combo.isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Combo not found");
  }
  if ("category" in payload) {
    delete payload.category;
  }

  /* ---------- SLUG ---------- */
  if (payload.slug && payload.slug !== combo.slug) {
    const newSlug = makeSlug(payload.slug);
    const exists = await ComboService.findOne({
      slug: newSlug,
      _id: { $ne: comboId },
    });

    if (exists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Combo with this slug already exists"
      );
    }

    payload.slug = newSlug;
  }

  /* ---------- TAGS ---------- */
  if ("tags" in payload) {
    combo.tags = normalizeTags(payload.tags);
    delete payload.tags;
  }
  if ("services" in payload) {
    if (!Array.isArray(payload.services) || payload.services.length < 2) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Combo must contain at least 2 services"
      );
    }

    const enrichedServices = [];

    for (const item of payload.services) {
      const service = await HairService.findById(item.service);

      if (!service || service.isDeleted) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "HairService not found"
        );
      }

      enrichedServices.push({
        service: service._id,
        nameSnapshot: service.name,
        unitPriceSnapshot: service.price,
        durationSnapshot: service.duration,
        quantity: item.quantity || 1,
      });
    }

    combo.services = enrichedServices;
    delete payload.services;
  }

  Object.assign(combo, payload);
  return await combo.save();
};

/* ================= DELETE ================= */
const deleteCombo = async (comboId) => {
  validateObjectId(comboId, "Combo ID");

  const combo = await ComboService.findById(comboId);
  if (!combo) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Combo not found");
  }

  combo.isDeleted = true;
  combo.isActive = false;

  return await combo.save();
};

/* ================= LIST ================= */
const listCombos = async (filter = {}, options = {}) => {
  const query = {
    isDeleted: false,
    ...filter,
  };

  return await ComboService.find(query)
    .populate({
      path: "services.service",
      select: "name finalPrice duration",
    })
    .sort(options.sortBy || { priority: -1, popularityScore: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 10);
};

/* ================= EXPORT ================= */
export const ComboSalonService = {
  getComboById,
  getComboBySlug,
  createCombo,
  updateCombo,
  deleteCombo,
  listCombos,
};
