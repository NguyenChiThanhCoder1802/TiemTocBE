import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
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
    })
  ),

  login: validate(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    })
  ),

  refreshToken: validate(
    Joi.object({
      refreshToken: Joi.string().required()
    })
  )
}
