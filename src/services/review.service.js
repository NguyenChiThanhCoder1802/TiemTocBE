import Review from "../models/Review.model.js";
import Booking from "../models/Booking.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { recalculateServiceRating } 
  from "../domains/hairService/recalculateServiceRating.js";
  import { recalculateStaffRating }
  from "../domains/staff/recalculateStaffRating.js";
const createReview = async (userId, payload) => {
  const { service, staff, booking } = payload;
   const bookingDoc = await Booking.findOne({
    _id: booking,
    customer: userId,
    status: "completed"
  });
  if (!bookingDoc) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Bạn chỉ có thể review booking đã hoàn thành"
    );
  }
  if (service) {
    const hasService = bookingDoc.services?.some(
      s => s.service.toString() === service
    );

    if (!hasService) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Dịch vụ không thuộc booking này"
      );
    }
  }
  if (service && bookingDoc.bookingType !== "service") {
  throw new ApiError(
    StatusCodes.BAD_REQUEST,
    "Booking combo không thể review dịch vụ riêng lẻ"
  );
}
  //  Check staff thuộc booking
  if (staff) {
    if (bookingDoc.staff.toString() !== staff) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Nhân viên không thuộc booking này"
      );
    }
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
const getReviewsByBooking = async (bookingId, userId) => {
 return Review.find({
  booking: bookingId,
  user: userId,
  isDeleted: false
})
  .populate("service", "name")
  .populate("staff", "name")
  .sort({ createdAt: -1 });
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
const getMyReviews = async (userId) => {
  return Review.find({
    user: userId,
    isDeleted: false,
  })
    .populate("service", "name images")
    .populate("staff", "name avatar")
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
  delete payload.service;
  delete payload.staff;
  delete payload.booking;
  delete payload.user;
  delete payload.isDeleted;
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
     isDeleted: false,
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
  getReviewsByBooking,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewsByStaff,
};
