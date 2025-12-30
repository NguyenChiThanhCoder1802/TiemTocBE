import Review from "../models/Review.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const createReview = async (userId, payload) => {
  try {
    return await Review.create({
      user: userId,
      ...payload,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Bạn đã review dịch vụ này rồi"
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
  return review.save();
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
};

export const ReviewService = {
  createReview,
  getReviewsByService,
  updateReview,
  deleteReview,
};
