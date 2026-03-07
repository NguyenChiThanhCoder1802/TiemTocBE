import { BUSINESS_CONFIG } from "../../config/business.config.js";

/* ================= CHECK SLOT 30 PHÚT ================= */

export const isValidTimeSlot = (date) => {
  const d = new Date(date);

  const minutes = d.getMinutes();

  return minutes % BUSINESS_CONFIG.slotMinutes === 0;
};

/* ================= CHECK GIỜ MỞ CỬA ================= */

export const isWithinBusinessHours = (startTime, duration) => {
  const start = new Date(startTime);

  const end = new Date(start.getTime() + duration * 60000);

  const open = new Date(start);
  open.setHours(BUSINESS_CONFIG.openHour, 0, 0, 0);

  const close = new Date(start);
  close.setHours(BUSINESS_CONFIG.closeHour, 0, 0, 0);

  if (start < open) {

    return {
      valid: false,
      message: `Tiệm mở cửa lúc ${BUSINESS_CONFIG.openHour}:00`,
      suggestedStarTime: open.toISOString()
    };
  }

  if (end > close) {
    // tính giờ cuối cùng trước khi tiệm đóng cửa
    const latestStart = new Date(close.getTime() - duration * 60000);
    const minutes = latestStart.getMinutes();
    const roundedMinutes =
      Math.floor(minutes / BUSINESS_CONFIG.slotMinutes) *
      BUSINESS_CONFIG.slotMinutes;

    latestStart.setMinutes(roundedMinutes);
    latestStart.setSeconds(0);
    latestStart.setMilliseconds(0);

    return {
      valid: false,
      message: "Dịch vụ vượt quá giờ đóng cửa. Vui lòng chọn giờ sớm hơn.",
      suggestedStartTime: latestStart.toISOString()
    };
  }

  return { valid: true };
};