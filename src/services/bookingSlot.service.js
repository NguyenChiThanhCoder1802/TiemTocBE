import Booking from "../models/Booking.model.js";
import Staff from "../models/Staff.model.js";
import { generateDaySlots } from "../utils/booking/generateSlots.js";
import { BUSINESS_CONFIG } from "../config/business.config.js";

export const getAvailableSlotsService = async (date, duration, customerId) => {
  const requestDate = new Date(date);

  const now = new Date();

  /* ===== CHECK MAX BOOKING DATE ===== */

  const maxBookingDate = new Date();
  maxBookingDate.setDate(
    maxBookingDate.getDate() + BUSINESS_CONFIG.maxBookingDays
  );

  if (requestDate > maxBookingDate) {
    throw new Error(
      `Chỉ được đặt lịch trước tối đa ${BUSINESS_CONFIG.maxBookingDays} ngày`
    );
  }

  const slots = generateDaySlots(date);

  const result = [];

  const dayStart = new Date(date);
  dayStart.setHours(0,0,0,0);


  const dayEnd = new Date(date);
  dayEnd.setHours(23,59,59,999);
   /* ===== QUERY 1: LẤY BOOKING TRONG NGÀY ===== */

  const bookings = await Booking.find({
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: dayEnd },
    endTime: { $gt: dayStart }
  }).select("staff startTime endTime customer");
  /* ===== QUERY 2: LẤY STAFF ACTIVE ===== */

  const staffs = await Staff.find({
    workingStatus: "active"
  }).select("_id");

 const staffIds = staffs.map(s => s._id.toString());

  /* ===== TÁCH BOOKING KHÁCH ===== */

 const customerBookings = bookings.filter(
    b => b.customer?.toString() === customerId?.toString()
  );

  for (const slot of slots) {

    const start = new Date(slot);
    const end = new Date(start.getTime() + duration * 60000);

    const close = new Date(date);
    close.setHours(BUSINESS_CONFIG.closeHour, 0, 0, 0);
    // thời gian đặt ít nhất
    const minBookingTime = new Date(
    now.getTime() + BUSINESS_CONFIG.minAdvanceMinutes * 60000
  );
  
   if (start < minBookingTime) {
    result.push({
      time: start.toISOString(),
      available: false,
      reason: `Phải đặt lịch trước ít nhất ${BUSINESS_CONFIG.minAdvanceMinutes} phút`
    });
    continue;
  }

    /* ===== CHECK ĐÓNG CỬA ===== */

    if (end > close) {
      result.push({
        time: start.toISOString(),
        available: false,
        reason: "Quá giờ đóng cửa"
      });
      continue;
    }
    /* ===== CHECK KHÁCH TRÙNG LỊCH ===== */

   const customerConflict = customerBookings.some(
  b => start < b.endTime && end > b.startTime
);
    if (customerConflict) {
      result.push({
        time: start.toISOString(),
        available: false,
        reason: "Bạn đã có lịch trong khung giờ này"
      });
      continue;
    }
     /* ===== TÌM STAFF RẢNH ===== */

    const busyStaffIds = new Set(
  bookings
    .filter(b => start < b.endTime && end > b.startTime)
    .map(b => b.staff?.toString())
);

   const availableStaff = staffIds.find(
  id => !busyStaffIds.has(id)
);
    if (!availableStaff) {
      result.push({
        time: start.toISOString(),
        available: false,
        reason: "Không có nhân viên rảnh"
      });
      continue;
    }

    result.push({
      time: start.toISOString(),
      available: true
    });
  }

  return result;
};