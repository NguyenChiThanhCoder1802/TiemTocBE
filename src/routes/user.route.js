import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload, uploadAvatarMiddleware } from "../middlewares/upload.middleware.js";
import { UserController } from "../controllers/user.controller.js";

const Router = express.Router();

/**
 * Update avatar
 */
Router.put(
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  uploadAvatarMiddleware,
  UserController.updateAvatar
);
// yêu thích dịch vụ
Router.post(
  "/me/favorites/:serviceId",
  authMiddleware,
  UserController.toggleFavoriteService
);
// lấy danh sách dịch vụ yêu thích
Router.get(
  "/me/favorites",
  authMiddleware,
  UserController.getMyFavoriteServices
);

export const userRouter = Router;
