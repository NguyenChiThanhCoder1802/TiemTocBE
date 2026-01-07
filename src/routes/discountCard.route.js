import express from "express";
import { DiscountCardController} from "../controllers/discountCard.controller.js";

import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateCheckDiscount } from "../middlewares/discount.middleware.js";
import {createDiscountSchema,
  updateDiscountSchema,
} from "../validations/discountCard.validation.js";

const Router = express.Router();


Router.post("/apply",authMiddleware,validateCheckDiscount,DiscountCardController.applyDiscount);

Router.post("/",authMiddleware,verifyAdmin,validate(createDiscountSchema),DiscountCardController.createDiscount);

Router.put("/:id",authMiddleware,verifyAdmin,validate(updateDiscountSchema),DiscountCardController.updateDiscount);


Router.delete("/:id",authMiddleware,verifyAdmin,DiscountCardController.deleteDiscount);


Router.get("/",authMiddleware,verifyAdmin,DiscountCardController.getAllDiscounts);

export const DiscountCardRouter = Router;