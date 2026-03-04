import Joi from "joi";
import mongoose from "mongoose";

/* =============== Custom ObjectId validator =============== */
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};

export const createComboSchema = Joi.object({
  name: Joi.string().trim().min(3).required(),

  slug: Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[a-z0-9-]+$/)
  .optional(),


  description: Joi.string().allow("").max(500),

  images: Joi.array().items(Joi.string().uri()),

  tags: Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()),
  Joi.string()
).optional(),


  services: Joi.array()
    .items(
      Joi.object({
        service: Joi.string().custom(objectId).required(),
        quantity: Joi.number().integer().min(1).max(10).default(1),
      })
    )
    .min(2)
    .unique((a, b) => a.service === b.service)
    .required()
    .messages({
      "array.unique": "Services in combo must be unique",
    }),

  pricing: Joi.object({
    originalPrice: Joi.number().min(1).required(),
    comboPrice: Joi.number()
      .min(1)
      .required()
      .less(Joi.ref("originalPrice"))
      .messages({
        "number.less": "Combo price must be lower than original price",
      }),
  }).required(),

  duration: Joi.number().integer().min(1).max(600).required(),

  activePeriod: Joi.object({
    startAt: Joi.date(),
    endAt: Joi.date().greater(Joi.ref("startAt")),
  }).messages({
    "date.greater": "endAt must be greater than startAt",
  }),
});
export const updateComboSchema = createComboSchema.fork(
  [
    "name",
    "slug",
    "description",
    "images",
    "tags",
    "services",
    "pricing",
    "duration",
    "activePeriod",
  ],
  (schema) => schema.optional()
);

