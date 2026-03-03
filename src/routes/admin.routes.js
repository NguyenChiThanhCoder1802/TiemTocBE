import express from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";
const Router = express.Router();
Router.get("/dashboard", authMiddleware, verifyAdmin, AdminController.getAdminDashboard);
Router.get('/staffs', authMiddleware, verifyAdmin, AdminController.getStaffList)
Router.post('/staffs/:userId/approve', authMiddleware, verifyAdmin, AdminController.approveStaff)

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

Router.patch(
  "/bookings/:bookingId/pay",
  authMiddleware,
  verifyAdmin,
  AdminController.markBookingAsPaid
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