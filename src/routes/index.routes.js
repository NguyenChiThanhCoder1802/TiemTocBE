import express from "express";
import { authRouter } from "./auth.routes.js";
import { hariServiceRouter } from "./harisalon.routes.js";
import { categoryRouter } from "./category.route.js";
import { reviewRouter } from "./review.route.js";
import { userRouter } from "./user.route.js";
import { adminRouter } from "./admin.routes.js";
import { DiscountCardRouter } from "./discountCard.route.js";
import { staffRouter } from "./staff.routes.js";

const Router = express.Router();
Router.use("/admin", adminRouter);
Router.use("/auth", authRouter);
Router.use("/categories", categoryRouter);
Router.use("/hairservices", hariServiceRouter);
Router.use("/reviews", reviewRouter);
Router.use("/users", userRouter)
Router.use('/staffs', staffRouter)

Router.use("/discount-cards", DiscountCardRouter);
export const APIS = Router;