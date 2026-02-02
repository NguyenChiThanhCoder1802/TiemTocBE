import mongoose from "mongoose";
import User from "../models/User.model.js";
import HairService from "../models/HairService.model.js";
import ApiError from "../utils/ApiError.js";
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
    // ❌ Remove favorite
    user.favoriteServices.pull(serviceId);
    service.favoriteCount = Math.max(service.favoriteCount - 1, 0);
  } else {
    // ❤️ Add favorite
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

export const UserService = {
  toggleFavoriteService,
  getMyFavoriteServices
};
