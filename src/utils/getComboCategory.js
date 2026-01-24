import Category from "../models/Category.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const getComboCategoryId = async () => {
  const category = await Category.findOne({
    name: "Combo",
    isDeleted: false,
  });

  if (!category) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Danh mục Combo chưa tồn tại"
    );
  }

  return category._id;
};
