import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { UserService } from "../services/user.service.js";
export const UserController = {
  async updateAvatar(req, res) {
    if (!req.body.avatar) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar is required");
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.body.avatar },
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      message: "Avatar updated successfully",
      avatar: user.avatar
    });
  },
  async toggleFavoriteService(req, res, next) {
    try {
      const result = await UserService.toggleFavoriteService(
        req.user.id,
        req.params.serviceId
      );

      res.status(StatusCodes.OK).json({
        message: result.isFavorited
          ? "Service added to favorites"
          : "Service removed from favorites",
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyFavoriteServices(req, res, next) {
    try {
      const services = await UserService.getMyFavoriteServices(req.user.id);
      res.status(StatusCodes.OK).json({
        message: "Favorite services retrieved successfully",
        data: services
      });
    } catch (err) {
      next(err);
    }
  },
  async updateProfile(req, res, next) {
  try {
    const updatedUser = await UserService.updateProfile(
      req.user.id,
      req.body
    );

    res.status(StatusCodes.OK).json({
      message: "Cập nhật thông tin thành công",
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
},

async changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    await UserService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    res.status(StatusCodes.OK).json({
      message: "Đổi mật khẩu thành công"
    });
  } catch (err) {
    next(err);
  }
},
};
