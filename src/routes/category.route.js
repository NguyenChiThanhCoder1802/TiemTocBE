import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { CategoryController } from "../controllers/category.controller.js";
import { authMiddleware, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    createCategorySchema,
    updateCategorySchema,
} from "../validations/category.validation.js";

const Router = express.Router();

// Public routes
Router.get("/", CategoryController.getCategories);
Router.get("/:id", CategoryController.getCategoryById);
Router.get("/:id/with-services", CategoryController.getCategoryWithServices);
Router.get("/:id/stats", CategoryController.getCategoryStats);

// Admin routes
Router.post(
    "/",
    authMiddleware,
    verifyAdmin,
    validate(createCategorySchema),
    CategoryController.createCategory
);

Router.put(
    "/:id",
    authMiddleware,
    verifyAdmin,
    validate(updateCategorySchema),
    CategoryController.updateCategory
);

Router.delete(
    "/:id",
    authMiddleware,
    verifyAdmin,
    CategoryController.deleteCategory
);

Router.patch(
    "/:id/restore",
    authMiddleware,
    verifyAdmin,
    CategoryController.restoreCategory
);

Router.patch(
    "/:id/order",
    authMiddleware,
    verifyAdmin,
    CategoryController.changeCategoryOrder
);

Router.patch(
    "/bulk/status",
    authMiddleware,
    verifyAdmin,
    CategoryController.bulkUpdateCategoryStatus
);

export const categoryRouter = Router;
