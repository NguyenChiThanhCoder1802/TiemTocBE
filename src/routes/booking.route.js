import express from "express";
import { createBooking, getMyBookings,getBookingDetail,cancelBooking } from "../controllers/booking.controller.js";
import { validate } from "../middlewares/booking.middleware.js";
import { createBookingSchema } from "../validations/booking.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationMiddleware } from "../middlewares/pagination.middleware.js";
const Router = express.Router();

Router.post(
  "/",
  authMiddleware,
  validate(createBookingSchema),
  createBooking
);
Router.get(
  "/my",
  authMiddleware,
  paginationMiddleware,
  getMyBookings
);
Router.get(
  "/:id",
  authMiddleware,
  getBookingDetail
);
Router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelBooking
);

export const BookingRouter = Router;
