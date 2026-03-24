// validations/staff.validation.js
import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";

const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    next();
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.details.map(d => d.message).join(", ")
      )
    );
  }
};

export const staffValidation = {
  /* ================= CREATE ================= */
  create: validate(
    Joi.object({
      name: Joi.string().required().messages({
        "string.empty": "Tên nhân viên không được để trống"
      }),

      phone: Joi.string()
        .pattern(/^[0-9]{9,11}$/)
        .optional()
        .messages({
          "string.pattern.base": "Số điện thoại không hợp lệ"
        }),

      email: Joi.string().email().optional().messages({
        "string.email": "Email không hợp lệ"
      }),

      experienceYears: Joi.number().min(0).optional().messages({
        "number.base": "Số năm kinh nghiệm phải là số",
        "number.min": "Số năm kinh nghiệm không được nhỏ hơn 0"
      }),

      position: Joi.string()
        .valid("stylist", "assistant", "manager")
        .optional(),

      salary: Joi.number().min(0).optional(),

      note: Joi.string().allow(""),

      avatar: Joi.string().uri().allow("")
    })
  ),

  /* ================= UPDATE ================= */
  update: validate(
    Joi.object({
      name: Joi.string().optional(),

      phone: Joi.string()
        .pattern(/^[0-9]{9,11}$/)
        .optional(),

      email: Joi.string().email().optional(),

      experienceYears: Joi.number().min(0).optional(),

      position: Joi.string()
        .valid("stylist", "assistant", "manager")
        .optional(),

      salary: Joi.number().min(0).optional(),

      workingStatus: Joi.string()
        .valid("active", "off", "resigned")
        .optional(),

      note: Joi.string().allow(""),

      avatar: Joi.string().uri().allow("")
    })
  ),

  /* ================= DELETE ================= */
  delete: validate(
    Joi.object({
      staffId: Joi.string().required()
    })
  )
};