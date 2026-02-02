export const paginationMiddleware = (req, res, next) => {
  let { page = 1, limit = 10 } = req.query

  page = Number(page)
  limit = Number(limit)

  const MAX_LIMIT = 50

  if (!Number.isInteger(page) || !Number.isInteger(limit)) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "page và limit phải là số nguyên"
      )
    )
  }

  if (page <= 0 || limit <= 0) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "page và limit phải là số dương"
      )
    )
  }

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT
  }

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  }

  next()
}
