import { StatusCodes } from "http-status-codes";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Dữ liệu không hợp lệ",
        errors: error.details.map((err) => err.message),
      });
    }


    req.body = value;

    next();
  };
};
