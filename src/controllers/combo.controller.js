import { StatusCodes } from "http-status-codes";
import { ComboSalonService } from "../services/combo.service.js";

/* ================= GET BY ID ================= */
const getComboById = async (req, res, next) => {
  try {
    const combo = await ComboSalonService.getComboById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Combo retrieved successfully",
      data: combo
    });
  } catch (err) {
    next(err);
  }
};
export const getComboBySlug = async (req, res) => {
  const combo = await ComboSalonService.getComboBySlug(
    req.params.slug
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: combo,
  });
};
/* ================= CREATE ================= */
const createCombo = async (req, res, next) => {
  try {
    const combo = await ComboSalonService.createCombo(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Combo created successfully",
      data: combo
    });
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE ================= */
const updateCombo = async (req, res, next) => {
  try {
    const combo = await ComboSalonService.updateCombo(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Combo updated successfully",
      data: combo
    });
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE ================= */
const deleteCombo = async (req, res, next) => {
  try {
    await ComboSalonService.deleteCombo(req.params.id);
    res.status(StatusCodes.NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

/* ================= LIST ================= */
const listCombos = async (req, res, next) => {
  try {
    const combos = await ComboSalonService.listCombos({}, req.query);
    res.status(StatusCodes.OK).json({
      message: "Combos retrieved successfully",
      data: combos
    });
  } catch (err) {
    next(err);
  }
};

export const ComboController = {
  getComboById,
  getComboBySlug,
  createCombo,
  updateCombo,
  deleteCombo,
  listCombos,
};
