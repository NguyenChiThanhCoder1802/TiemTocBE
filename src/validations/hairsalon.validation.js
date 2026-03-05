import Joi from "joi";
import { safeString } from "../utils/joiSafeString.js";
export const createHairServiceSchema = Joi.object({
  name: safeString.min(3).max(255).required(),

  slug: safeString.lowercase().optional(),

  category: safeString.required(),

  description: safeString.allow("").max(3000).optional(),

  tags: Joi.alternatives().try(
    Joi.array().items(safeString.max(50)),
    Joi.string() 
  ).optional(),

  price: Joi.number().min(0).required(),

  duration: Joi.number().min(1).required(),

  serviceDiscount: Joi.object({
    percent: Joi.number().min(0).max(100).default(0),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional(),
  }).optional(),

  isActive: Joi.boolean().truthy("true").falsy("false").optional(),

  priority: Joi.number().min(0).optional(),

  images: Joi.array().items(Joi.string()).optional(),

  // multer xử lý
}).unknown(false);


export const updateHairServiceSchema = Joi.object({
  name: safeString.min(3).max(255).optional(),

  slug: safeString.lowercase().optional(),

  category: safeString.optional(),

  description: safeString.allow("").max(3000).optional(),

  tags: Joi.alternatives().try(
    Joi.array().items(safeString.max(50)),
    Joi.string()
  ).optional(),

  price: Joi.number().min(0).optional(),


  duration: Joi.number().min(1).optional(),

  serviceDiscount: Joi.object({
    percent: Joi.number().min(0).max(100),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional(),
  }).optional(),

  isActive: Joi.boolean().truthy("true").falsy("false").optional(),

  priority: Joi.number().min(0).optional(),

  images: Joi.array().items(Joi.string()).optional(),

  removedImages: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
}).unknown(false);
export const hairServiceQuerySchema = Joi.object({
  category: Joi.string().optional(),

  search: Joi.string().trim().min(1).max(100).optional(),

  minPrice: Joi.number().min(0).optional(),

  maxPrice: Joi.number().min(0).optional(),

  discountOnly: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .optional(),

  sort: Joi.string()
    .valid(
      "priority",
      "newest",
      "price_asc",
      "price_desc",
      "popular"
    )
    .optional(),

  page: Joi.number().min(1).optional(),

  limit: Joi.number().min(1).max(100).optional()
});