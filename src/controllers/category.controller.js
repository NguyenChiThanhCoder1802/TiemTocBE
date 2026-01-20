import { CategoryService } from "../services/category.service.js";
import { StatusCodes } from "http-status-codes";

const getCategories = async (req, res, next) => {
    try {
        const { isActive } = req.query;
        const filters = {};

        if (isActive !== undefined) {
            filters.isActive = isActive === "true";
        }

        const categories = await CategoryService.getCategories(filters);
        res.status(StatusCodes.OK).json({
            message: "Categories retrieved successfully",
            data: categories,  
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get category by ID
 * GET /categories/:id
 */
const getCategoryById = async (req, res, next) => {
    try {
        const category = await CategoryService.getCategoryById(req.params.id);
        res.status(StatusCodes.OK).json({
            message: "Category retrieved successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get category with associated services
 * GET /categories/:id/with-services
 */
const getCategoryWithServices = async (req, res, next) => {
    try {
        const categoryData = await CategoryService.getCategoryWithServices(
            req.params.id
        );
        res.status(StatusCodes.OK).json({
            message: "Category with services retrieved successfully",
            data: categoryData,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create new category
 * POST /categories
 */
const createCategory = async (req, res, next) => {
    try {
        const category = await CategoryService.createCategory(req.body);
        res.status(StatusCodes.CREATED).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update category
 * PUT /categories/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const category = await CategoryService.updateCategory(
            req.params.id,
            req.body
        );
        res.status(StatusCodes.OK).json({
            message: "Category updated successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete category (soft delete)
 * DELETE /categories/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        await CategoryService.deleteCategory(req.params.id);
        res.status(StatusCodes.NO_CONTENT).end();
    } catch (err) {
        next(err);
    }
};

/**
 * Restore deleted category
 * PATCH /categories/:id/restore
 */
const restoreCategory = async (req, res, next) => {
    try {
        const category = await CategoryService.restoreCategory(req.params.id);
        res.status(StatusCodes.OK).json({
            message: "Category restored successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get category statistics
 * GET /categories/:id/stats
 */
const getCategoryStats = async (req, res, next) => {
    try {
        const stats = await CategoryService.getCategoryStats(req.params.id);
        res.status(StatusCodes.OK).json({
            message: "Category statistics retrieved successfully",
            data: stats,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Change category order
 * PATCH /categories/:id/order
 */
const changeCategoryOrder = async (req, res, next) => {
    try {
        const { order } = req.body;
        const category = await CategoryService.changeCategoryOrder(
            req.params.id,
            order
        );
        res.status(StatusCodes.OK).json({
            message: "Category order updated successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Bulk update category status
 * PATCH /categories/bulk/status
 */
const bulkUpdateCategoryStatus = async (req, res, next) => {
    try {
        const { categoryIds, isActive } = req.body;
        const result = await CategoryService.bulkUpdateCategoryStatus(
            categoryIds,
            isActive
        );
        res.status(StatusCodes.OK).json({
            message: "Category status updated successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const CategoryController = {
    getCategories,
    getCategoryById,
    getCategoryWithServices,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    getCategoryStats,
    changeCategoryOrder,
    bulkUpdateCategoryStatus,
};
