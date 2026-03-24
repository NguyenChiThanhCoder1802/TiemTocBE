import express from "express";
import { createBooking, getBookingById , checkStaffAvailability,checkAllStaffAvailability,getAvailableSlots,
  getMyBookings,
  cancelBooking, previewBooking} from "../controllers/booking.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationMiddleware } from "../middlewares/pagination.middleware.js";
const Router = express.Router();

Router.post("/",authMiddleware,createBooking);

Router.post("/preview",authMiddleware, previewBooking);
Router.get(
  "/check-all-availability",
  authMiddleware,
  checkAllStaffAvailability
);
Router.get(
  "/available-slots",
  authMiddleware,
  getAvailableSlots
);
Router.get(
  "/my",
  authMiddleware,
  paginationMiddleware,
  getMyBookings
);
Router.get("/check-availability", authMiddleware, checkStaffAvailability)
Router.get("/:id", authMiddleware, getBookingById)


Router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelBooking
);

export const BookingRouter = Router;
