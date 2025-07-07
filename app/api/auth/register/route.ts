import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import User from "@/lib/models/User";
import Category from "@/lib/models/Category";
import { generateToken } from "@/lib/middleware/auth";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

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

async function createDefaultCategories(userId: string) {
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password } = body as RegisterBody;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
