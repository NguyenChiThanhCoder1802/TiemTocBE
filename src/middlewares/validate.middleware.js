import { StatusCodes } from "http-status-codes";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
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

 if (property === "query") {
      req.validatedQuery = value
    } else {
      req[property] = value
    }


    next();
  };
};
