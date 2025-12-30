import express from "express";
import { AuthController}from "../controllers/auth.controller.js";
import { authValidation } from '../validations/auth.validation.js'
import { limit } from "../middlewares/limit.middleware.js";

import { authMiddleware, verifyRoles } from '../middlewares/auth.middleware.js'
const Router = express.Router();

Router.post("/register",limit.registerLimitMiddleware,authValidation.register,AuthController.register);
Router.post("/verify-otp", limit.otpLimitMiddleware,authValidation.verifyOtp, AuthController.verifyOtp);
Router.post("/login", limit.loginLimitMiddleware, authValidation.login,AuthController.login);

Router.get("/users",authMiddleware,verifyRoles('admin'), AuthController.getAllUsers);
Router.get("/me",authMiddleware, AuthController.getMe)
export const authRouter = Router;