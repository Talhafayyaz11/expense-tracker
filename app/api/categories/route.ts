import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateToken } from "@/lib/middleware/auth";

interface CreateCategoryBody {
  name: string;
  description?: string;
  color?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticateToken(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const categories = await Category.find({ userId: user._id }).sort({
      name: 1,
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticateToken(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { name, description, color } = body as CreateCategoryBody;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name cannot exceed 50 characters",
        },
        { status: 400 }
      );
    }

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({ userId: user._id, name });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Create category
    const category = new Category({
      name,
      description,
      color: color || "#3b82f6",
      userId: user._id,
    });

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
