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
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
      , applyAsStaff: Joi.boolean().optional()
    })
  ),

  staffRegister: validate(
    Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      confirmpassword: Joi.string().min(6).required(),
      experienceYears: Joi.number().min(0).optional(),
      skills: Joi.array().items(Joi.string()).min(1).required(),
      position: Joi.string().valid('stylist', 'assistant', 'manager').optional()
    })
  ),


  verifyOtp: validate(
    Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(6).required()
    })
  ),
  login: validate(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    })
  ),
  forgotPassword: validate(
    Joi.object({
      email: Joi.string().email().required()
    })
  ),

  resetPassword: validate(
    Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(6).required(),
      newPassword: Joi.string().min(6).required()
    })
  ),
  refreshToken: validate(
    Joi.object({
      refreshToken: Joi.string().optional()
    })
  )
}
