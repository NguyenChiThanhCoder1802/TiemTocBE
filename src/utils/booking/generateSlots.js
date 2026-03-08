import { BUSINESS_CONFIG } from "../../config/business.config.js";

export const generateDaySlots = (date) => {
  const slots = [];

  const start = new Date(date);
  start.setHours(BUSINESS_CONFIG.openHour, 0, 0, 0);

  const end = new Date(date);
  end.setHours(BUSINESS_CONFIG.closeHour, 0, 0, 0);

  while (start < end) {
    slots.push(new Date(start));
    start.setMinutes(start.getMinutes() + BUSINESS_CONFIG.slotMinutes);
  }

  return slots;
};