import express from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validations/review.validation.js";
import { upload , uploadReviewImagesMiddleware} from "../middlewares/upload.middleware.js";


const Router = express.Router();

/**
 * Tạo review
 */
Router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  uploadReviewImagesMiddleware,
  validate(createReviewSchema),
  ReviewController.createReview
);

/**
 * Lấy review theo dịch vụ
 */
Router.get(
  "/service/:serviceId",
  ReviewController.getReviewsByService
);
Router.get(
  "/staff/:staffId",
  ReviewController.getReviewsByStaff
);

/**
 * Cập nhật review
 */
Router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 5),
  uploadReviewImagesMiddleware,
  validate(updateReviewSchema),
  ReviewController.updateReview
);

/**
 * Xoá review
 */
Router.delete(
  "/:id",
  authMiddleware,
  ReviewController.deleteReview
);

export const reviewRouter = Router;
