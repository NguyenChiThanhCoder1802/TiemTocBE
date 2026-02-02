import {
  createBookingService,
  getMyBookingsService,getBookingDetailService,cancelBookingService
} from "../services/booking.service.js";
import { StatusCodes } from "http-status-codes";
/* ================== CREATE BOOKING ================== */
export const createBooking = async (req, res) => {
  try {
    const booking = await createBookingService({
      customer: req.user.id,
      ...req.body,
      paymentStatus: "unpaid",
      status: "pending"
    });

    res.status(201).json({
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};

/* ================== GET MY BOOKINGS ================== */
export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    const result = await getMyBookingsService(
      req.user.id,
      status,
      req.pagination
    );

    res.status(StatusCodes.OK).json({
      message: "Bookings retrieved successfully",
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};
export const getBookingDetail = async (req, res) => {
  try {
    const booking = await getBookingDetailService(
      req.params.id,
      req.user.id
    );

    res.json({
      data: booking
    });
  } catch (err) {
    res.status(404).json({
      message: err.message
    });
  }
};
export const cancelBooking = async (req, res) => {
  try {
    const booking = await cancelBookingService(
      req.params.id,
      req.user.id
    );

    res.json({
      message: "Huỷ booking thành công",
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};