import ApiError from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
export const paginationMiddleware = (req, res, next) => {
  let { page = 1, limit = 10 } = req.query

  page = Number(page)
  limit = Number(limit)

  if (page <= 0 || limit <= 0) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "page và limit phải là số dương"
      )
    )
  }

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  }

  next()
}