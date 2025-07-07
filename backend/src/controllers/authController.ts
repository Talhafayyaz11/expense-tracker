import { Request, Response } from "express";
import User from "../models/User";
import Category from "../models/Category";
import { generateToken } from "../middleware/auth";
import { AuthRequest, AuthResponse, ApiResponse } from "../types";

// Default categories to create for new users
const DEFAULT_CATEGORIES = [
  {
    name: "Food & Dining",
    description: "Restaurants, groceries, and food delivery",
    color: "#ef4444", // red
  },
  {
    name: "Transportation",
    description: "Gas, public transport, rideshare, and car maintenance",
    color: "#3b82f6", // blue
  },
  {
    name: "Entertainment",
    description: "Movies, games, hobbies, and leisure activities",
    color: "#8b5cf6", // purple
  },
  {
    name: "Shopping",
    description: "Clothing, electronics, and general shopping",
    color: "#f59e0b", // amber
  },
  {
    name: "Bills & Utilities",
    description: "Electricity, water, internet, phone, and other bills",
    color: "#10b981", // emerald
  },
  {
    name: "Healthcare",
    description: "Medical expenses, prescriptions, and health insurance",
    color: "#06b6d4", // cyan
  },
  {
    name: "Education",
    description: "Tuition, books, courses, and learning materials",
    color: "#84cc16", // lime
  },
  {
    name: "Travel",
    description: "Vacations, business trips, and travel expenses",
    color: "#f97316", // orange
  },
];

async function createDefaultCategories(userId: string): Promise<void> {
  try {
    const categories = DEFAULT_CATEGORIES.map((category) => ({
      ...category,
      userId,
      isDefault: true,
    }));

    await Category.insertMany(categories);
    console.log(
      `Created ${categories.length} default categories for user ${userId}`
    );
  } catch (error) {
    console.error("Error creating default categories:", error);
    // Don't throw error here to avoid breaking user registration
  }
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: AuthRequest = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Create default categories for the new user
    await createDefaultCategories(user._id.toString());

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        token,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: AuthRequest = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        token,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    res.json({
      success: true,
      data: {
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
