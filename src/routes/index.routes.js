import express from "express";
import { authRouter } from "./auth.routes.js";
import { hariServiceRouter } from "./harisalon.routes.js";
import { reviewRouter } from "./review.route.js";
import { userRouter } from "./user.route.js";
const Router = express.Router();
Router.use("/auth", authRouter);
Router.use("/hairservices", hariServiceRouter);
Router.use("/reviews", reviewRouter);
Router.use("/users",userRouter)
export const APIS = Router;