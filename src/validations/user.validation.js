import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
      "string.min": "Họ tên phải có ít nhất 2 ký tự",
      "string.max": "Họ tên không được quá 100 ký tự"
    }),


  phone: Joi.string().pattern(/^[0-9]{9,15}$/).allow("").optional().messages({
      "string.pattern.base": "Số điện thoại phải từ 9–15 chữ số"
    }),

  avatar: Joi.string().uri().allow(""),

  gender: Joi.string().valid("male", "female", "other").messages({
      "any.only": "Giới tính không hợp lệ"
    })
})


export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),

  newPassword: Joi.string()
    .min(6)
    .not(Joi.ref("currentPassword"))
    .required()
});