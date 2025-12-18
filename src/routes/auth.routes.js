import express from "express";
import { register, verifyOtp, login } from "../controllers/auth.controller.js";

const Router = express.Router();

Router.post("/register", register);
Router.post("/verify-otp", verifyOtp);
Router.post("/login", login);
export default Router;