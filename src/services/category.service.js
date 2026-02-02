import Category from "../models/Category.model.js";
import HairService from "../models/HairService.model.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";


const getCategories = async (filters = {}) => {
    const query = { isDeleted: false, ...filters };

    const categories = await Category.find(query)
        .sort({ order: 1, createdAt: -1 });

    return categories;
};


const getCategoryById = async (categoryId) => {
    const category = await Category.findById(categoryId);

    if (!category || category.isDeleted) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

    return category;
};

const getCategoryWithServices = async (categoryId) => {
    const category = await getCategoryById(categoryId);

    const services = await HairService.find({
        category: category._id,
        isDeleted: false,
        isActive: true,
    });

    return {
        ...category.toObject(),
        services: services,
        serviceCount: services.length,
    };
};


const createCategory = async (payload) => {
    // Check if category with same name exists
    const existingCategory = await Category.findOne({
        name: { $regex: `^${payload.name}$`, $options: "i" },
        isDeleted: false,
    });

    if (existingCategory) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            "Category with this name already exists"
        );
    }

    const category = await Category.create({
        name: payload.name.trim(),
        description: payload.description?.trim() || "",
        order: payload.order || 0,
        isActive: payload.isActive !== undefined ? payload.isActive : true,
    });

    return category;
};


const updateCategory = async (categoryId, payload) => {
    const category = await getCategoryById(categoryId);

    // If name is being updated, check for duplicates
    if (payload.name && payload.name !== category.name) {
        const existingCategory = await Category.findOne({
            _id: { $ne: categoryId },
            name: { $regex: `^${payload.name}$`, $options: "i" },
            isDeleted: false,
        });

        if (existingCategory) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Category with this name already exists"
            );
        }
    }

    const updateData = {};
    if (payload.name) updateData.name = payload.name.trim();
    if (payload.description !== undefined) updateData.description = payload.description?.trim() || "";
    if (payload.order !== undefined) updateData.order = payload.order;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        { new: true, runValidators: true }
    );

    return updatedCategory;
};


const deleteCategory = async (categoryId) => {
    const category = await getCategoryById(categoryId);

    // Check if category has services
    const serviceCount = await HairService.countDocuments({
        category: category._id,
        isDeleted: false,
    });

    if (serviceCount > 0) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Cannot delete category with ${serviceCount} associated service(s)`
        );
    }

    const deletedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { isDeleted: true },
        { new: true }
    );

    return deletedCategory;
};

const restoreCategory = async (categoryId) => {
    const category = await Category.findById(categoryId);

    if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

    const restoredCategory = await Category.findByIdAndUpdate(
        categoryId,
        { isDeleted: false },
        { new: true }
    );

    return restoredCategory;
};

const getCategoryStats = async (categoryId) => {
    const category = await getCategoryById(categoryId);

    const stats = await HairService.aggregate([
        {
            $match: {
                category: category.name,
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: "$category",
                totalServices: { $sum: 1 },
                activeServices: {
                    $sum: { $cond: ["$isActive", 1, 0] },
                },
                totalBookings: { $sum: "$bookingCount" },
                averageRating: { $avg: "$ratingAverage" },
                totalReviews: { $sum: "$ratingCount" },
            },
        },
    ]);

    return {
        category: category.toObject(),
        stats: stats[0] || {
            totalServices: 0,
            activeServices: 0,
            totalBookings: 0,
            averageRating: 0,
            totalReviews: 0,
        },
    };
};

const changeCategoryOrder = async (categoryId, order) => {
    const category = await getCategoryById(categoryId);

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { order },
        { new: true }
    );

    return updatedCategory;
};

const bulkUpdateCategoryStatus = async (categoryIds, isActive) => {
    const result = await Category.updateMany(
        { _id: { $in: categoryIds }, isDeleted: false },
        { isActive }
    );

    return result;
};

export const CategoryService = {
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
