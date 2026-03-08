import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authValidation } from '../validations/auth.validation.js'
import { limit } from "../middlewares/limit.middleware.js";

import { authMiddleware,verifyAdmin } from '../middlewares/auth.middleware.js'
const Router = express.Router();

Router.post("/register", limit.registerLimitMiddleware, authValidation.register, AuthController.register);
Router.post("/login", limit.loginLimitMiddleware, authValidation.login, AuthController.login);
Router.post('/forgot-password', authValidation.forgotPassword, AuthController.forgotPassword);
Router.post('/reset-password', limit.resetPasswordLimitMiddleware, authValidation.resetPassword, AuthController.resetPassword);
Router.get("/users", authMiddleware, verifyAdmin, AuthController.getAllUsers);
Router.get("/me", authMiddleware, AuthController.getMe)
Router.post('/logout', authMiddleware, AuthController.logout)
export const authRouter = Router;