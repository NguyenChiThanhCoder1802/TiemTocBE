import Joi from "joi";
import { safeString } from "../utils/joiSafeString.js";

export const createReviewSchema = Joi.object({
  service: Joi.string().optional().allow(null),
  staff: Joi.string().optional().allow(null),

  rating: Joi.number().min(1).max(5).required(),

  comment: Joi.string().allow("").optional(),
}).custom((value, helpers) => {
  if (!value.service && !value.staff) {
    return helpers.message(
      "Review phải thuộc về dịch vụ hoặc nhân viên"
    );
  }

  if (value.service && value.staff) {
    return helpers.message(
      "Review chỉ được thuộc về 1 đối tượng"
    );
  }

  return value;
});
export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),

  comment: safeString
    .allow("")
    .max(1000)
    .optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});
