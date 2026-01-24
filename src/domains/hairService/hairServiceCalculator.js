/* ================= PRICE & DISCOUNT ================= */

export const calculateServiceDiscount = async (service) => {
  if (!service || typeof service.price !== "number") {
    throw new Error("calculateServiceDiscount: price must be number");
  }

  const now = new Date();

  let finalPrice = service.price;
  let isActive = false;

  const discount = service.serviceDiscount;

  if (
    discount &&
    discount.percent > 0 &&
    discount.startAt &&
    discount.endAt &&
    now >= discount.startAt &&
    now <= discount.endAt
  ) {
    finalPrice =
      service.price - (service.price * discount.percent) / 100;
    isActive = true;
  }

  return {
    isActive,
    finalPrice: Math.round(finalPrice),
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
