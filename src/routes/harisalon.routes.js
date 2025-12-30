import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { HairSalonController } from "../controllers/hairsalon.controller.js";
import { upload, uploadServiceImagesMiddleware } from "../middlewares/upload.middleware.js";
// import { limit } from "../middlewares/limit.middleware.js";
import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";
import { createHairServiceSchema, updateHairServiceSchema } from "../validations/hairsalon.validation.js";
// import { paginationMiddleware } from "../middlewares/pagination.middleware.js";
const Router = express.Router();
Router.get(
  "/statistics",
  authMiddleware,
  verifyAdmin,
  HairSalonController.getServiceStatistics
);
Router.get("/", HairSalonController.getHairServices);
Router.get("/:id", HairSalonController.getHairServiceById);
Router.post("/", authMiddleware, verifyAdmin, upload.array("images", 6), uploadServiceImagesMiddleware, validate(createHairServiceSchema), HairSalonController.createHairService);
Router.put("/:id", authMiddleware, verifyAdmin, upload.array("images", 6), uploadServiceImagesMiddleware, validate(updateHairServiceSchema), HairSalonController.updateHairService);
Router.delete("/:id", authMiddleware, verifyAdmin, HairSalonController.deleteHairService);

export const hariServiceRouter = Router;    