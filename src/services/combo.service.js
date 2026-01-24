import mongoose from "mongoose";
import crypto from "crypto";
import ComboService from "../models/ComboService.model.js";
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
  }).populate({
    path: "services.service",
    select: "name finalPrice duration",
  });

  if (!combo) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Combo not found");
  }

  ComboService.updateOne(
    { _id: comboId },
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

  /* ---------- SERVICES ---------- */
  payload.services = Array.isArray(payload.services)
    ? payload.services
    : [];
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
  createCombo,
  updateCombo,
  deleteCombo,
  listCombos,
};
