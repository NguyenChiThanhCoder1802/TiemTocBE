import { ReviewService } from "../services/review.service.js";
import { StatusCodes } from "http-status-codes";

const createReview = async (req, res, next) => {
  try {
    const review = await ReviewService.createReview(
      req.user.id,
      req.body
    );

    res.status(StatusCodes.CREATED).json({
      message: "Review thành công",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

const getReviewsByService = async (req, res, next) => {
  try {
    const reviews = await ReviewService.getReviewsByService(
      req.params.serviceId
    );

    res.json({
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await ReviewService.updateReview(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      message: "Cập nhật review thành công",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await ReviewService.deleteReview(
      req.params.id,
      req.user.id
    );

    res.json({
      message: "Xoá review thành công",
    });
  } catch (err) {
    next(err);
  }
};

export const ReviewController = {
  createReview,
  getReviewsByService,
  updateReview,
  deleteReview,
};
