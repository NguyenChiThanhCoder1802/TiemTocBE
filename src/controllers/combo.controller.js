import { StatusCodes } from "http-status-codes";
import {ComboSalonService} from "../services/combo.service.js";

/* ================= GET BY ID ================= */
export const getComboById = async (req, res, next) => {
  try {
    const combo = await ComboSalonService.getComboById(req.params.id);
    res.status(StatusCodes.OK).json(combo);
  } catch (err) {
    next(err);
  }
};

/* ================= CREATE ================= */
export const createCombo = async (req, res, next) => {
  try {
    const combo = await ComboSalonService.createCombo(req.body);
    res.status(StatusCodes.CREATED).json(combo);
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE ================= */
export const updateCombo = async (req, res, next) => {
  try {
    const combo = await ComboSalonService.updateCombo(req.params.id, req.body);
    res.status(StatusCodes.OK).json(combo);
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE ================= */
export const deleteCombo = async (req, res, next) => {
  try {
    const combo = await ComboSalonService.deleteCombo(req.params.id);
    res.status(StatusCodes.OK).json(combo);
  } catch (err) {
    next(err);
  }
};

/* ================= LIST ================= */
export const listCombos = async (req, res, next) => {
  try {
    const combos = await ComboSalonService.listCombos({}, req.query);
    res.status(StatusCodes.OK).json({
      data: combos
    });
  } catch (err) {
    next(err);
  }
};
export const ComboController = {
  getComboById,
  createCombo,
    updateCombo,
    deleteCombo,
    listCombos,
};