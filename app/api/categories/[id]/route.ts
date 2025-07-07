import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateToken } from "@/lib/middleware/auth";

interface UpdateCategoryBody {
  name?: string;
  description?: string;
  color?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authResult = await authenticateToken(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = params;

    const category = await Category.findOne({ _id: id, userId: user._id });
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authResult = await authenticateToken(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = params;
    const body = await request.json();
    const { name, description, color } = body as UpdateCategoryBody;

    // Find category
    const category = await Category.findOne({ _id: id, userId: user._id });
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (name !== undefined) {
      if (name.length > 50) {
        return NextResponse.json(
          {
            success: false,
            message: "Category name cannot exceed 50 characters",
          },
          { status: 400 }
        );
      }

      // Check if name already exists for this user (excluding current category)
      const existingCategory = await Category.findOne({
        userId: user._id,
        name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: "Category with this name already exists" },
          { status: 400 }
        );
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

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authResult = await authenticateToken(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = params;

    const category = await Category.findOneAndDelete({
      _id: id,
      userId: user._id,
    });
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
