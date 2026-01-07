import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
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
  }
};
