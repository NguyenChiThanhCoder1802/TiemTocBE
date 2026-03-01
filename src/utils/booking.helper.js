import HairService from "../models/HairService.model.js";
import ComboService from "../models/ComboService.model.js";
import Booking from "../models/Booking.model.js";

/* ================= CALCULATE ================= */
export const calculateBookingData = async (data) => {
  let totalDuration = 0;
  let originalPrice = 0;
  let finalPrice = 0;

  let servicesSnapshot = [];
  let comboSnapshot = null;

  if (data.bookingType === "service") {
    const ids = data.services.map(s => s.service);

    const serviceDocs = await HairService.find({
      _id: { $in: ids },
      isActive: true,
      isDeleted: false
    });

    if (serviceDocs.length !== ids.length)
      throw new Error("Dịch vụ không hợp lệ");

    for (const item of data.services) {
      const service = serviceDocs.find(
        s => s._id.toString() === item.service
      );

      totalDuration += service.duration * item.quantity;
      originalPrice += service.price * item.quantity;
      finalPrice += (service.finalPrice || service.price) * item.quantity;

      servicesSnapshot.push({
        service: service._id,
        nameSnapshot: service.name,
        priceSnapshot: service.finalPrice || service.price,
        quantity: item.quantity
      });
    }
  }

  if (data.bookingType === "combo") {
    const combo = await ComboService.findById(data.combo);

    if (!combo) throw new Error("Combo không tồn tại");

    totalDuration = combo.duration;
    originalPrice = combo.pricing.originalPrice;
    finalPrice = combo.pricing.comboPrice;

    comboSnapshot = {
      combo: combo._id,
      name: combo.name,
      originalPrice,
      comboPrice: finalPrice
    };
  }

  return {
    totalDuration,
    originalPrice,
    finalPrice,
    servicesSnapshot,
    comboSnapshot
  };
};

/* ================= CHECK STAFF ================= */
export const isStaffBusy = async (staffId, start, end) => {
  return await Booking.exists({
    staff: staffId,
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: end },
    endTime: { $gt: start }
  });
};