import Joi from "joi";
import { safeString } from "../utils/joisafeString.js";
const today = new Date()
today.setHours(0, 0, 0, 0)

export const createDiscountSchema = Joi.object({
  name: safeString.required(),

  code: safeString.uppercase().required(),

  description: safeString.allow("").optional(),

  targetType: Joi.string()
    .valid("order", "service")
    .required(),

  discountType: Joi.string()
    .valid("percent", "fixed")
    .required(),

  discountValue: Joi.number()
    .when('discountType', {
      is: 'percent',
      then: Joi.number()
        .min(0)
        .max(100)
        .required()
        .messages({
          'number.max': 'Giảm giá theo % không được vượt quá 100%',
        }),
      otherwise: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Giảm giá cố định không được nhỏ hơn 0',
        }),
    }),

  maxDiscountAmount: Joi.number().min(0).optional(),

  minValue: Joi.number().min(0).default(0),

  serviceIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional(),

  userLimit: Joi.number().integer().min(1).default(1),

  quantity: Joi.number().integer().min(1).required(),

  startDate: Joi.date()
    .min(today)
    .required()
    .messages({
      'date.min': 'Ngày bắt đầu không được nhỏ hơn hôm nay'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.greater': 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
    }),

  isActive: Joi.boolean().default(true),
}).unknown(false)
export const updateDiscountSchema = Joi.object({
  name: safeString.optional(),
  description: safeString.allow("").optional(),

  discountValue: Joi.number()
    .when('discountType', {
      is: 'percent',
      then: Joi.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
          'number.max': 'Giảm giá theo % không được vượt quá 100%',
        }),
      otherwise: Joi.number()
        .min(0)
        .optional()
        .messages({
          'number.min': 'Giảm giá cố định không được nhỏ hơn 0',
        }),
    }),
  maxDiscountAmount: Joi.number().min(0).optional(),
  minValue: Joi.number().min(0).optional(),

  quantity: Joi.number().integer().min(1).optional(),
  userLimit: Joi.number().integer().min(1).optional(),

  startDate: Joi.date()
    .min('now')
    .optional(),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .optional(),

  isActive: Joi.boolean().optional(),
}).unknown(false);
