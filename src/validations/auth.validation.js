import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true
    })
    next()
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.details.map(d => d.message).join(', ')
      )
    )
  }
}

export const authValidation = {

  register: validate(
    Joi.object({
      name: Joi.string().min(6).max(50).required().messages({
      "string.empty": "Tên không được để trống",
      "string.min": "Tên phải ít nhất 6 ký tự"
    }),
      email: Joi.string().email().required().messages({
      "string.email": "Email không hợp lệ",
      "string.empty": "Email không được để trống"
    }),
      password: Joi.string().min(6).required()
      .messages({ 
         "string.min": "Mật khẩu phải từ 6 ký tự",
        "string.empty": "Mật khẩu không được để trống"
      }),
      confirmpassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 
        'any.only': 'Mật khẩu xác nhận không khớp'
      }),
        })
      ),

  createStaff: validate(
  Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Tên nhân viên không được để trống"
      }),
    phone: Joi.string().pattern(/^[0-9]{9,11}$/).optional().messages({
        "string.pattern.base": "Số điện thoại không hợp lệ"
      }),
    email: Joi.string().email().optional().messages({
        "string.email": "Email không hợp lệ"
      }),
    experienceYears: Joi.number().min(0).messages({
        "number.base": "Số năm kinh nghiệm phải là số",
        "number.min": "Số năm kinh nghiệm không được nhỏ hơn 0"
      }),
    skills: Joi.array().items(Joi.string()),
    position: Joi.string().valid("stylist"),
    salary: Joi.number(),
    note: Joi.string().allow("")
  })
),


 
  login: validate(
    Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống"
      }),
      password: Joi.string().min(6).required().messages({
        "string.min": "Mật khẩu phải ít nhất 6 ký tự",
        "string.empty": "Mật khẩu không được để trống"
      })
    })
  ),
  forgotPassword: validate(
    Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống"
      })
    })
  ),

  resetPassword: validate(
    Joi.object({
     email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống"
      }),

      newPassword: Joi.string().min(6).required().messages({
        "string.min": "Mật khẩu mới phải ít nhất 6 ký tự",
        "string.empty": "Mật khẩu mới không được để trống"
      })
    })
  ),
  refreshToken: validate(
    Joi.object({
      refreshToken: Joi.string().optional()
    })
  )
}
