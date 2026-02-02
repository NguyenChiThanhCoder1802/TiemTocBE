import Joi from "joi";

export const createBookingSchema = Joi.object({
  bookingType: Joi.string().valid("service", "combo").required(),

  services: Joi.when("bookingType", {
    is: "service",
    then: Joi.array().min(1).required(),
    otherwise: Joi.forbidden()
  }),

  combo: Joi.when("bookingType", {
    is: "combo",
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),

  staff: Joi.string().optional(),

  startTime: Joi.date().greater("now").required(),
   paymentMethod: Joi.string()
    .valid("cash", "vnpay", "momo")
    .required(),

  note: Joi.string().allow("")
});
