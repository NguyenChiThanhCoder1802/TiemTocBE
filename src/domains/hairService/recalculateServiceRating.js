import Review from "../../models/Review.model.js";
import HairService from "../../models/HairService.model.js";
import {
  calculateConversionRate,
  calculatePopularityScore,
  calculateFeatured,
  calculatePriority
} from "./hairServiceCalculator.js";

export const recalculateServiceRating = async (serviceId) => {
  // 1️⃣ Lấy toàn bộ review hợp lệ
  const reviews = await Review.find({
    service: serviceId,
    isDeleted: false
  });

  const ratingCount = reviews.length;

  const ratingAverage =
    ratingCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

  // 2️⃣ Update service
  const service = await HairService.findById(serviceId);
  if (!service) return;

  service.ratingCount = ratingCount;
  service.ratingAverage = Number(ratingAverage.toFixed(2));

  // 3️⃣ Tính metrics khác
  service.conversionRate = calculateConversionRate(service);
  service.popularityScore = calculatePopularityScore(service);
  service.isFeatured = calculateFeatured(service);
  service.priority = calculatePriority(service);

  await service.save();
};
