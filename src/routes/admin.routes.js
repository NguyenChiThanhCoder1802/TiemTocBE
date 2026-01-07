import express from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";
const Router = express.Router();
Router.get("/dashboard", authMiddleware, verifyAdmin, AdminController.getAdminDashboard);
Router.get('/staffs', authMiddleware, verifyAdmin, AdminController.getStaffList)
Router.post('/staffs/:userId/approve', authMiddleware, verifyAdmin, AdminController.approveStaff)
export const adminRouter = Router;