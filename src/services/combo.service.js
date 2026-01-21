import ComboService from "../models/ComboService.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
/* ================= GET BY ID ================= */
export const getComboById = async (comboId) => {
  const combo = await ComboService.findById(comboId).populate(
    "includedServices",
    "name finalPrice"
  );
    if (!combo) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Combo not found");
  }
    ComboService.updateOne(
      { _id: comboId },
      { $inc: { "stats.viewCount": 1 } }
    ).exec();
    return combo;
}
/* ================= CREATE ================= */
export const createCombo = async (comboData) => {
  const combo = new ComboService(comboData);
  await combo.save();
  return combo;
}
/* ================= UPDATE ================= */
export const updateCombo = async (comboId, comboData) => {
  const combo = await ComboService.findByIdAndUpdate(comboId, comboData, { new: true });
  if (!combo) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Combo not found");
  }
    return combo;
}
/* ================= DELETE ================= */
export const deleteCombo = async (comboId) => {
    const combo = await ComboService.findByIdAndUpdate(comboId, { isDeleted: true }, { new: true });
    if (!combo) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Combo not found");
  }
    return combo;
}
/* ================= LIST ================= */
export const listCombos = async (filter = {}, options = {}) => {
  const combos = await ComboService.find({ ...filter, isDeleted: false })
    .sort(options.sortBy || { createdAt: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 10)
  return combos;
}
export const ComboSalonService = {
  getComboById,
  createCombo,
    updateCombo,
    deleteCombo,
    listCombos,
};