import express from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";
import { authValidation } from "../validations/auth.validation.js";
const Router = express.Router();
Router.get("/dashboard", authMiddleware, verifyAdmin, AdminController.getAdminDashboard);
// quản lý nhân viên
Router.post(
  "/staffs",
  authMiddleware,
  verifyAdmin,
  authValidation.createStaff,
  AdminController.createStaff
)
Router.get('/staffs', authMiddleware, verifyAdmin, AdminController.getStaffList)

// Booking management
Router.get(
  "/bookings",
  authMiddleware,
  verifyAdmin,
  AdminController.getAllBookings
)

Router.patch(
  "/bookings/:bookingId/approve",
  authMiddleware,
  verifyAdmin,
  AdminController.approveBooking
)

Router.patch(
  "/bookings/:bookingId/complete",
  authMiddleware,
  verifyAdmin,
  AdminController.completeBooking
)
// Doanh thu\
Router.get(
  "/revenue",
  authMiddleware,
  verifyAdmin,
  AdminController.getRevenueDashboard
)

Router.get(
  "/revenue/online-by-month",
  authMiddleware,
  verifyAdmin,
  AdminController.getOnlineRevenueByMonthController
)

Router.get(
  "/revenue/payment-stats",
  authMiddleware,
  verifyAdmin,
  AdminController.getOnlinePaymentStatsController
)
export const adminRouter = Router;