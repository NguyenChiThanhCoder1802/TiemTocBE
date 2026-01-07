import Review from "../../models/Review.model.js";
import Staff from "../../models/Staff.model.js";

export const recalculateStaffRating = async (staffId) => {
  // 1️⃣ Lấy toàn bộ review hợp lệ
  const reviews = await Review.find({
    staff: staffId,
    isDeleted: false
  });

  const ratingCount = reviews.length;

  const ratingAverage =
    ratingCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

  // 2️⃣ Update staff
  const staff = await Staff.findById(staffId);
  if (!staff) return;

  staff.ratingCount = ratingCount;
  staff.ratingAverage = Number(ratingAverage.toFixed(2));

  await staff.save();
};
