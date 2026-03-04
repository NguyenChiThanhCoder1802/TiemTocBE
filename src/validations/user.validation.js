import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  email: Joi.string().email().lowercase().trim(),

  phone: Joi.string().pattern(/^[0-9]{9,15}$/),

  avatar: Joi.string().uri().allow(""),

  gender: Joi.string().valid("male", "female", "other")
}).min(1); // bắt buộc phải có ít nhất 1 field


export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),

  newPassword: Joi.string()
    .min(6)
    .not(Joi.ref("currentPassword"))
    .required()
});