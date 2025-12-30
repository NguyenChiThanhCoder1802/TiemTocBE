import Joi from "joi";
import { safeString } from "../utils/joiSafeString.js";

export const createReviewSchema = Joi.object({
  service: Joi.string().hex().length(24).required(),

  rating: Joi.number().min(1).max(5).required(),

  comment: safeString
    .allow("")
    .max(1000)
    .optional(),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),

  comment: safeString
    .allow("")
    .max(1000)
    .optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});
