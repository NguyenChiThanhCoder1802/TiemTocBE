import Joi from "joi";
import { safeString } from "../utils/joiSafeString.js";

export const createCategorySchema = Joi.object({
    name: safeString.min(3).max(100).required(),

    description: safeString
        .allow("")
        .max(1000)
        .optional(),

    order: Joi.number().min(0).optional(),

    isActive: Joi.boolean().truthy("true").falsy("false").optional(),
});

export const updateCategorySchema = Joi.object({
    name: safeString.min(3).max(100).optional(),

    description: safeString
        .allow("")
        .max(1000)
        .optional(),

    order: Joi.number().min(0).optional(),

    isActive: Joi.boolean().truthy("true").falsy("false").optional(),
}).min(1);
