import { createBookingSchema } from "../validations/booking.validation.js";
import { getAvailableSlotsService } from "../services/bookingSlot.service.js";
import { createBookingService, checkStaffAvailabilityService,getMyBookingsService,getBookingByIdService,cancelBookingService,previewBookingService } from "../services/booking.service.js";
export const checkStaffAvailability = async (req, res) => {
  try {
    const { staffId, startTime, duration } = req.query;

    const available = await checkStaffAvailabilityService(
      staffId,
      startTime,
      Number(duration)
    );

    res.json({ available });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
export const getAvailableSlots = async (req, res) => {
  try {

    const { date, duration } = req.query;

    if (!date || !duration) {
      return res.status(400).json({
        message: "date và duration là bắt buộc"
      });
    }

    const slots = await getAvailableSlotsService (
      date,
      Number(duration),
      req.user?.id
    );

    res.json({
      success: true,
      data: slots
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
export const createBooking = async (req, res, next) => {
  try {
    const { error, value } =
      createBookingSchema.validate(req.body);

    if (error)
      throw new Error(error.message);

    const booking = await createBookingService(
      value,
      req.user.id,
      value.paymentMethod
    );

    res.status(201).json({
      message: "Đặt lịch thành công (Thanh toán tại salon)",
      data: booking
    });

  } catch (err) {
    next(err);
  }
};

export const previewBooking = async (req, res, next) => {
  try {
    const result = await previewBookingService(req.body, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await getBookingByIdService(id);

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
};
export const checkAllStaffAvailability = async (req, res) => {
  try {
    const { startTime, duration } = req.query;

    const availability =
      await checkAllStaffAvailabilityService(
        startTime,
        Number(duration)
      );

    res.json({ availability });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
export const getMyBookings = async (req, res) => {
  try {
     const { status } = req.query;
    const result = await getMyBookingsService(
      req.user.id,
      req.pagination,
      status
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
export const cancelBooking = async (req, res) => {
  try {
    const booking =
      await cancelBookingService(
        req.params.id,
        req.user.id
      );

    res.json({
      message: "Hủy lịch thành công",
      data: booking
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};