import { StatusCodes } from 'http-status-codes';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(StatusCodes.BAD_REQUEST).json({
    message: err.message || "Có lỗi xảy ra",
  });
};
