import express from "express";
import {ComboController} from "../controllers/combo.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadComboImagesMiddleware } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createComboSchema, updateComboSchema } from "../validations/combo.validation.js";
import { verifyAdmin,authMiddleware } from "../middlewares/auth.middleware.js";
import { parseComboBody } from "../middlewares/combo.middleware.js";
const Router = express.Router();

Router.get("/", ComboController.listCombos);
Router.get("/:id", ComboController.getComboById);

Router.post(
  "/",
  authMiddleware,
  verifyAdmin,
  upload.array("images", 5),
  uploadComboImagesMiddleware,
  parseComboBody,
  validate(createComboSchema),
  ComboController.createCombo
);

Router.put(
  "/:id",
  authMiddleware,
  verifyAdmin,
  upload.array("images", 5),
  uploadComboImagesMiddleware,
  parseComboBody,
  validate(updateComboSchema),
  ComboController.updateCombo
);

Router.delete(
  "/:id",
  authMiddleware,
  verifyAdmin,
  ComboController.deleteCombo
);

export const ComboRouter = Router;
