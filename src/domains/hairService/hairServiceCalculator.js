import HairService from "../../models/HairService.model.js";

/* ================= PRICE & DISCOUNT ================= */

export const calculateServiceDiscount = async (service) => {
  const now = new Date();

  /* ================= COMBO ================= */
  if (service.isCombo) {
    if (!service.includedServices?.length) {
      return {
        isActive: false,
        finalPrice: 0
      };
    }

    // Lấy các service con
    const services = await HairService.find({
      _id: { $in: service.includedServices },
      isDeleted: false,
      isActive: true
    });

    // Tổng giá các service con (ưu tiên finalPrice)
    const basePrice = services.reduce(
      (sum, s) => sum + (s.finalPrice ?? s.price),
      0
    );

    let finalPrice = basePrice;
    let isActive = false;

    if (
      service.serviceDiscount?.percent > 0 &&
      service.serviceDiscount.startAt &&
      service.serviceDiscount.endAt &&
      now >= service.serviceDiscount.startAt &&
      now <= service.serviceDiscount.endAt
    ) {
      finalPrice =
        basePrice -
        (basePrice * service.serviceDiscount.percent) / 100;
      isActive = true;
    }

    return {
      isActive,
      finalPrice: Math.round(finalPrice)
    };
  }

  /* ================= SERVICE ĐƠN ================= */
  let finalPrice = service.price;
  let isActive = false;

  if (
    service.serviceDiscount?.percent > 0 &&
    service.serviceDiscount.startAt &&
    service.serviceDiscount.endAt &&
    now >= service.serviceDiscount.startAt &&
    now <= service.serviceDiscount.endAt
  ) {
    finalPrice =
      service.price -
      (service.price * service.serviceDiscount.percent) / 100;
    isActive = true;
  }

  return {
    isActive,
    finalPrice: Math.round(finalPrice)
  };
};

/* ================= METRICS ================= */

export const calculateConversionRate = (service) => {
  if (service.viewCount > 0) {
    return service.bookingCount / service.viewCount;
  }
  return 0;
};

export const calculatePopularityScore = (service) => {
  return (
    service.bookingCount * 0.4 +
    service.weeklyBookingCount * 0.2 +
    service.monthlyBookingCount * 0.2 +
    service.favoriteCount * 0.1 +
    service.ratingAverage * service.ratingCount * 0.05 +
    service.conversionRate * 100 * 0.05
  );
};

export const calculateFeatured = (service) => {
  return (
    service.bookingCount >= 50 &&
    service.ratingAverage >= 4.2 &&
    service.popularityScore >= 70
  );
};

export const calculatePriority = (service) => {
  const recencyBonus = service.lastBookedAt
    ? Math.max(
        0,
        30 -
          Math.floor(
            (Date.now() - service.lastBookedAt.getTime()) /
              (1000 * 60 * 60 * 24)
          )
      )
    : 0;

  return (
    service.popularityScore * 0.7 +
    service.ratingAverage * 10 +
    service.conversionRate * 100 +
    recencyBonus
  );
};
