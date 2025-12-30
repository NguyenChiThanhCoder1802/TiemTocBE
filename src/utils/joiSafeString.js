import Joi from "joi";

const XSS_PATTERN =
  /<[^>]*>|javascript:|on\w+=|data:text\/html/i;

export const safeString = Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (XSS_PATTERN.test(value)) {
      return helpers.error("string.xss");
    }
    return value;
  }, "XSS protection")
  .messages({
    "string.xss": "Nội dung chứa mã HTML hoặc JavaScript không hợp lệ"
  });
