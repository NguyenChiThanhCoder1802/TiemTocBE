import DiscountCard from "../models/DiscountCard.model.js";
import HairService from "../models/HairService.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import {
  isExpired,
  isOutOfQuantity,
  calculateDiscountAmount,
} from "../utils/discount.js";

/* ================= HELPER ================= */

const getValidDiscountByCode = async (code) => {
  const discount = await DiscountCard.findOne({
    code,
    isActive: true,
    isDeleted: false,
  });

  if (!discount) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Mã giảm giá không tồn tại"
    );
  }

  if (isExpired(discount)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Mã giảm giá đã hết hạn"
    );
  }

  if (isOutOfQuantity(discount)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Mã giảm giá đã hết lượt sử dụng"
    );
  }

  return discount;
};

/* ================= USER APPLY ================= */

const applyDiscount = async ({ code, serviceId, userId }) => {
  const discount = await getValidDiscountByCode(code);

  if (!serviceId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu serviceId");
  }

  /* ===== USER LIMIT ===== */
  const usedUser = discount.usedByUsers.find(
    (u) => u.userId.toString() === userId
  );

  if (usedUser && usedUser.usedCount >= discount.userLimit) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Bạn đã sử dụng mã giảm giá này quá số lần cho phép"
    );
  }

  /* ===== SERVICE VALIDATION ===== */
  const service = await HairService.findById(serviceId);
  if (!service || service.isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Dịch vụ không tồn tại");
  }

  if (service.isCombo) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Không áp dụng mã giảm giá cho combo"
    );
  }

  if (service.serviceDiscount?.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Dịch vụ đang có chương trình giảm giá khác"
    );
  }

  /* ===== CHECK SERVICE SCOPE ===== */
  if (
    discount.serviceIds.length > 0 &&
    !discount.serviceIds.some(
      (id) => id.toString() === serviceId
    )
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Mã giảm giá không áp dụng cho dịch vụ này"
    );
  }

  /* ===== MIN VALUE ===== */
  if (service.price < discount.minValue) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Dịch vụ chưa đạt giá trị tối thiểu"
    );
  }

  /* ===== CALCULATE ===== */
  const discountAmount = calculateDiscountAmount(
    service.price,
    discount.discountType,
    discount.discountValue,
    discount.maxDiscountAmount
  );

  return {
    discountId: discount._id,
    discountAmount,
    finalPrice: service.price - discountAmount,
  };
};


/* ================= ADMIN ================= */

const createDiscount = async (payload) => {
  const existed = await DiscountCard.findOne({
    code: payload.code,
  });

  if (existed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Mã giảm giá đã tồn tại"
    );
  }
  
  return DiscountCard.create(payload);
};

const updateDiscount = async (id, payload) => {
  const discount = await DiscountCard.findById(id);
  if (!discount || discount.isDeleted) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Không tìm thấy mã giảm giá"
    );
  }
  if (
    discount.discountType === 'percent' &&
    payload.discountValue > 100
  ) {
    throw new ApiError(
      400,
      'Giảm giá theo % không được vượt quá 100%'
    )
  }
  Object.assign(discount, payload);
  return discount.save();
};

const deleteDiscount = async (id) => {
  const discount = await DiscountCard.findById(id);
  if (!discount || discount.isDeleted) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Không tìm thấy mã giảm giá"
    );
  }

  discount.isDeleted = true;
  discount.isActive = false;
  return discount.save();
};

const getAllDiscounts = async () => {
  return DiscountCard.find({ isDeleted: false })
    .sort({ createdAt: -1 });
};

export const discountService = {
  applyDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getAllDiscounts,
};
