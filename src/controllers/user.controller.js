import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";

export const UserController = {
  async updateAvatar(req, res) {
    if (!req.body.avatar) {
      throw new ApiError(400, "Avatar is required");
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.body.avatar },
      { new: true }
    );

    res.status(200).json({
      message: "Avatar updated successfully",
      avatar: user.avatar
    });
  }
};
