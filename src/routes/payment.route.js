import express from "express";
import {
  createPayment,
  handleVnpayReturn,
  getMyPayments,
  getBookingRevenue,
} from "../controllers/payment.controller.js";

import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";

const Router = express.Router();

/* ================= USER ================= */

Router.post(
  "/vnpay",
  authMiddleware,
  createPayment
);

Router.get(
  "/vnpay-return",
  handleVnpayReturn
);


// User xem lịch sử thanh toán
Router.get("/my", authMiddleware, getMyPayments);

/* ================= ADMIN ================= */

// Admin xem doanh thu booking
Router.get("/admin/revenue", authMiddleware, verifyAdmin, getBookingRevenue);

export const paymentRouter = Router;