import Review from "../models/Review.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { recalculateServiceRating } 
  from "../domains/hairService/recalculateServiceRating.js";
  import { recalculateStaffRating }
  from "../domains/staff/recalculateStaffRating.js";
const createReview = async (userId, payload) => {
  const { service, staff } = payload;

  if (!service && !staff) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Review phải gắn với dịch vụ hoặc nhân viên"
    );
  }

  if (service && staff) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Review chỉ được gắn với dịch vụ HOẶC nhân viên"
    );
  }

  try {
    const review = await Review.create({
      user: userId,
      ...payload,
    });
    if (service) {
      await recalculateServiceRating(service);
    }
    if (staff) {
      await recalculateStaffRating(staff);
    }
    return review;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        service
          ? "Bạn đã review dịch vụ này rồi"
          : "Bạn đã review nhân viên này rồi"
      );
    }
    throw err;
  }
};


const getReviewsByService = async (serviceId) => {
  return Review.find({
    service: serviceId,
    isDeleted: false,
  })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
};
const getReviewsByStaff = async (staffId) => {
  return Review.find({
    staff: staffId,
    isDeleted: false
  })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
};

const updateReview = async (reviewId, userId, payload) => {
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
    isDeleted: false,
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review không tồn tại");
  }

  Object.assign(review, payload);
  await review.save();
   if (review.service) {
    await recalculateServiceRating(review.service);
  }
  if (review.staff) {
    await recalculateStaffRating(review.staff);
  }
  return review;
};

const deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review không tồn tại");
  }

  review.isDeleted = true;
   await review.save();


  if (review.service) {
    await recalculateServiceRating(review.service);
  }
  if (review.staff) {
    await recalculateStaffRating(review.staff);
  }
};

export const ReviewService = {
  createReview,
  getReviewsByService,
  updateReview,
  deleteReview,
  getReviewsByStaff,
};
