import { Request, Response } from "express";
import Category from "../models/Category";
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
  ApiResponse,
} from "../types";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find({
      userId: (req as any).user._id,
    }).sort({
      name: 1,
    });

    const response: ApiResponse<CategoryResponse[]> = {
      success: true,
      data: categories.map((category) => ({
        _id: category._id.toString(),
        name: category.name,
        description: category.description,
        color: category.color,
        userId: category.userId.toString(),
        isDefault: category.isDefault,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: (req as any).user._id,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    const response: ApiResponse<CategoryResponse> = {
      success: true,
      data: {
        _id: category._id.toString(),
        name: category.name,
        description: category.description,
        color: category.color,
        userId: category.userId.toString(),
        isDefault: category.isDefault,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, color }: CreateCategoryRequest = req.body;

    // Validation
    if (!name) {
      res.status(400).json({
        success: false,
        message: "Category name is required",
      });
      return;
    }

    if (name.length > 50) {
      res.status(400).json({
        success: false,
        message: "Category name cannot exceed 50 characters",
      });
      return;
    }

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      userId: (req as any).user._id,
      name,
    });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
      return;
    }

    // Create category
    const category = new Category({
      name,
      description,
      color: color || "#3b82f6",
      userId: (req as any).user._id,
    });

    await category.save();

    const response: ApiResponse<CategoryResponse> = {
      success: true,
      message: "Category created successfully",
      data: {
        _id: category._id.toString(),
        name: category.name,
        description: category.description,
        color: category.color,
        userId: category.userId.toString(),
        isDefault: category.isDefault,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, color }: UpdateCategoryRequest = req.body;

    // Find category
    const category = await Category.findOne({
      _id: req.params.id,
      userId: (req as any).user._id,
    });
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Update fields
    if (name !== undefined) {
      if (name.length > 50) {
        res.status(400).json({
          success: false,
          message: "Category name cannot exceed 50 characters",
        });
        return;
      }

      // Check if name already exists for this user (excluding current category)
      const existingCategory = await Category.findOne({
        userId: (req as any).user._id,
        name,
        _id: { $ne: req.params.id },
      });
      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
        return;
      }

      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (color !== undefined) {
      category.color = color;
    }

    await category.save();

    const response: ApiResponse<CategoryResponse> = {
      success: true,
      message: "Category updated successfully",
      data: {
        _id: category._id.toString(),
        name: category.name,
        description: category.description,
        color: category.color,
        userId: category.userId.toString(),
        isDefault: category.isDefault,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: (req as any).user._id,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
