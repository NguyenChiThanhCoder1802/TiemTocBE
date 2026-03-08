import express from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get(
  "/my",
  authMiddleware,
  notificationController.getMyNotifications
);

Router.patch(
  "/:id/read",
  authMiddleware,
  notificationController.markAsRead
);

Router.patch(
  "/read-all",
  authMiddleware,
  notificationController.markAllAsRead
);

export const NotificationRouter = Router;