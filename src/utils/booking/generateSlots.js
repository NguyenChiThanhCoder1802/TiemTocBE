import { BUSINESS_CONFIG } from "../../config/business.config.js";

export const generateDaySlots = (date) => {
  const slots = [];

  const start = new Date(`${date}T00:00:00.000Z`)
  start.setUTCHours(BUSINESS_CONFIG.openHour - 7, 0, 0, 0)

  const end = new Date(`${date}T00:00:00.000Z`)
  end.setUTCHours(BUSINESS_CONFIG.closeHour - 7, 0, 0, 0)

  while (start < end) {
    slots.push(new Date(start));
    start.setMinutes(start.getMinutes() + BUSINESS_CONFIG.slotMinutes);
  }

  return slots;
};