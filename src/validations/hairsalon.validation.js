import Joi from "joi";
import { safeString } from "../utils/joiSafeString.js";

export const createHairServiceSchema = Joi.object({
  name: safeString.min(3).max(255).required(),
  slug: safeString.lowercase().optional(),
  category: safeString.required(),

  description: safeString.allow("").max(3000).optional(),

  tags: Joi.alternatives().try(
    Joi.array().items(safeString.max(50)),
    safeString.max(50)
  ).optional(),

  isCombo: Joi.boolean().truthy("true").falsy("false").default(false),

  price: Joi.when("isCombo", {
    is: true,
    then: Joi.forbidden(),
    otherwise: Joi.number().min(0).required(),
  }),

  duration: Joi.when("isCombo", {
    is: true,
    then: Joi.forbidden(),
    otherwise: Joi.number().min(1).required(),
  }),

  combo: Joi.when("isCombo", {
    is: true,
    then: Joi.object({
      comboPrice: Joi.number().min(0).required(),
      endAt: Joi.date().required(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),

  includedServices: Joi.when("isCombo", {
    is: true,
    then: Joi.array()
      .items(Joi.string().hex().length(24))
      .min(2)
      .required(),
    otherwise: Joi.forbidden(),
  }),

  isActive: Joi.boolean().truthy("true").falsy("false").optional(),
  priority: Joi.number().min(0).optional(),

  images: Joi.alternatives().try(
    Joi.array().items(Joi.string().uri()),
    Joi.string().uri()
  ).optional(),
}).unknown(false);


export const updateHairServiceSchema = Joi.object({
  name: safeString.min(3).max(255).optional(),

  slug: safeString.lowercase().optional(),

  category: safeString.optional(),

  description: safeString.allow("").max(3000).optional(),

  tags: Joi.alternatives().try(
    Joi.array().items(safeString.max(50)),
    safeString.max(50)
  ).optional(),

  price: Joi.number().min(0).optional(),

  serviceDiscount: Joi.object({
    percent: Joi.number().min(0).max(100).default(0),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional(),
  }).optional(),

  duration: Joi.number().min(1).optional(),

  isCombo: Joi.boolean().truthy("true").falsy("false").optional(),

  includedServices: Joi.alternatives().try(
    Joi.array().items(Joi.string().hex().length(24)),
    Joi.array()
  ).optional(),

  isActive: Joi.boolean().truthy("true").falsy("false").optional(),

  priority: Joi.number().min(0).optional(),

  seo: Joi.alternatives().try(
    Joi.object({
      title: safeString.allow("").max(255),
      description: safeString.allow("").max(500),
      keywords: Joi.array().items(safeString.max(50)),
    }),
    Joi.string()
  ).optional(),

  images: Joi.alternatives().try(
    Joi.array().items(Joi.string().uri()),
    Joi.string().uri()
  ).optional(),

  removedImages: Joi.alternatives().try(
    Joi.array().items(Joi.string().uri()),
    Joi.string().uri()
  ).optional(),
}).unknown(false);
