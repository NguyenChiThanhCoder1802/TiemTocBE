import express from "express";
import {
  createBookingPayment,
  handleBookingVnpayReturn,
  getMyPayments,
  getBookingRevenue,
} from "../controllers/payment.controller.js";

import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";

const Router = express.Router();

/* ================= USER ================= */

// Tạo thanh toán booking
Router.post("/booking/vnpay", authMiddleware, createBookingPayment);

// VNPay return URL
Router.get("/booking/vnpay-return", handleBookingVnpayReturn);

// User xem lịch sử thanh toán
Router.get("/my", authMiddleware, getMyPayments);

/* ================= ADMIN ================= */

// Admin xem doanh thu booking
Router.get("/admin/revenue", authMiddleware, verifyAdmin, getBookingRevenue);

export const paymentRouter = Router;