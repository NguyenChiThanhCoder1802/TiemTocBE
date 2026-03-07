import Booking from "../models/Booking.model.js";
import Staff from "../models/Staff.model.js";
import { generateDaySlots } from "../utils/booking/generateSlots.js";
import { BUSINESS_CONFIG } from "../config/business.config.js";

export const getAvailableSlotsService = async (date, duration) => {

  const slots = generateDaySlots(date);

  const result = [];
    const now = new Date();
  for (const slot of slots) {

    const start = new Date(slot);
    const end = new Date(start.getTime() + duration * 60000);

    const close = new Date(slot);
    close.setHours(BUSINESS_CONFIG.closeHour, 0, 0, 0);
    // Check giờ quá khứ
     if (start < now) {
      result.push({
        time: start.toISOString(),
        available: false,
        reason: "Thời gian đã qua"
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

    /* ===== CHECK STAFF BẬN ===== */

    const busyBookings = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    }).select("staff");

    const busyStaffIds = busyBookings.map(b => b.staff);

    const availableStaff = await Staff.exists({
      workingStatus: "active",
      _id: { $nin: busyStaffIds }
    });

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