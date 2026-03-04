import mongoose from "mongoose";
import User from "../models/User.model.js";
import HairService from "../models/HairService.model.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

const toggleFavoriteService = async (userId, serviceId) => {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service ID không hợp lệ");
  }

  const service = await HairService.findOne({
    _id: serviceId,
    isDeleted: false,
    isActive: true
  });

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isFavorited = user.favoriteServices.some(
    id => id.toString() === serviceId
  );

  if (isFavorited) {
    user.favoriteServices.pull(serviceId);
    service.favoriteCount = Math.max(service.favoriteCount - 1, 0);
  } else {
    user.favoriteServices.push(serviceId);
    service.favoriteCount += 1;
  }

  await Promise.all([user.save(), service.save()]);

  return {
    isFavorited: !isFavorited,
    favoriteCount: service.favoriteCount
  };
};

const getMyFavoriteServices = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: "favoriteServices",
      match: { isDeleted: false, isActive: true },
      populate: { path: "category", select: "name" }
    })
    .lean();

  return user.favoriteServices || [];
};
const updateProfile = async (userId, updateData) => {
  // Nếu có email → kiểm tra trùng
  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId }
    });

    if (existingUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email đã được sử dụng"
      );
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select("-password");

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};

/**
 * Đổi mật khẩu
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isMatch) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Mật khẩu hiện tại không đúng"
    );
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  return true;
};
export const UserService = {
  toggleFavoriteService,
  getMyFavoriteServices,
  updateProfile,
  changePassword
};
