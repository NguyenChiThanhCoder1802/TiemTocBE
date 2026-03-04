import Joi from "joi";

export const createBookingSchema = Joi.object({
  staff: Joi.string(),

  bookingType: Joi.string()
    .valid("service", "combo")
    .required(),

  services: Joi.when("bookingType", {
    is: "service",
    then: Joi.array().items(
      Joi.object({
        service: Joi.string().required(),
      
      })
    ).min(1).required(),
    otherwise: Joi.forbidden()
  }),

  combo: Joi.when("bookingType", {
    is: "combo",
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),

  startTime: Joi.date().required(),

  paymentMethod: Joi.string()
    .valid("cash", "vnpay", "momo")
    .required(),
  discountCode: Joi.when("bookingType", {
  is: "service",
  then: Joi.string().trim().uppercase().allow(null, ""),
  otherwise: Joi.forbidden()
}),
});