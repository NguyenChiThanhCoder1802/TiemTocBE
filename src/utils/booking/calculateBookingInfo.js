import HairService from "../../models/HairService.model.js";
import ComboService from "../../models/ComboService.model.js";
import { isServiceDiscountValid } from "../discount.js";

export const calculateBookingInfo = async ({ bookingType, services, combo }) => {
  let totalDuration = 0;
  let originalPrice = 0;
  let afterServiceDiscount = 0;
  let servicesSnapshot = [];
  let comboSnapshot = null;

  /* ===== SERVICE MODE ===== */

  if (bookingType === "service") {
    const ids = services.map(s => s.service);

    const serviceDocs = await HairService.find({
      _id: { $in: ids },
      isActive: true,
      isDeleted: false
    });

    if (serviceDocs.length !== ids.length)
      throw new Error("Có dịch vụ không hợp lệ");

    for (const service of serviceDocs) {
      totalDuration += service.duration;
      originalPrice += service.price;

      const isDiscountValid = isServiceDiscountValid(service.serviceDiscount);

      const priceAfterDiscount = isDiscountValid
        ? Math.round(service.price * (1 - service.serviceDiscount.percent / 100))
        : service.price;

      afterServiceDiscount += priceAfterDiscount;

      servicesSnapshot.push({
        service: service._id,
        nameSnapshot: service.name,
        slugSnapshot: service.slug,
        originalPriceSnapshot: service.price,
        serviceDiscountPercent: isDiscountValid ? service.serviceDiscount.percent : 0,
        priceAfterServiceDiscount: priceAfterDiscount,
        durationSnapshot: service.duration,
        imageSnapshot: service.images
      });
    }
  }

  /* ===== COMBO MODE ===== */

  if (bookingType === "combo") {
    const comboDoc = await ComboService.findById(combo);

    if (!comboDoc)
      throw new Error("Combo không tồn tại");

    totalDuration = comboDoc.duration;
    originalPrice = comboDoc.pricing.originalPrice;
    afterServiceDiscount = comboDoc.pricing.comboPrice;

    comboSnapshot = {
      name: comboDoc.name,
      originalPrice,
      comboPrice: afterServiceDiscount,
      imageSnapshot: comboDoc.images || []
    };
  }

  return {
    totalDuration,
    originalPrice,
    afterServiceDiscount,
    servicesSnapshot,
    comboSnapshot
  };
};