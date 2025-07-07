import { Request, Response } from "express";
import Expense from "../models/Expense";
import {
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseQueryParams,
  StatsQueryParams,
  ExpenseStats,
  ApiResponse,
  ExpensesResponse,
  ExpenseResponse,
} from "../types";

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      category,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
    }: ExpenseQueryParams = req.query;

    // Build query
    const query: any = { userId: (req as any).user._id };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const response: ApiResponse<ExpensesResponse> = {
      success: true,
      data: {
        expenses: expenses.map((expense) => ({
          _id: expense._id.toString(),
          amount: expense.amount,
          category: expense.category,
          note: expense.note,
          date: expense.date.toISOString(),
          userId: expense.userId.toString(),
          createdAt: expense.createdAt.toISOString(),
          updatedAt: expense.updatedAt.toISOString(),
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: (req as any).user._id,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    const response: ApiResponse<ExpenseResponse> = {
      success: true,
      data: {
        _id: expense._id.toString(),
        amount: expense.amount,
        category: expense.category,
        note: expense.note,
        date: expense.date.toISOString(),
        userId: expense.userId.toString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get expense error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, category, note, date }: CreateExpenseRequest = req.body;

    // Validation
    if (!amount || !category || !date) {
      res.status(400).json({
        success: false,
        message: "Amount, category, and date are required",
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Amount must be positive",
      });
      return;
    }

    // Create expense
    const expense = new Expense({
      amount,
      category,
      note,
      date: new Date(date),
      userId: (req as any).user._id,
    });

    await expense.save();

    const response: ApiResponse<ExpenseResponse> = {
      success: true,
      message: "Expense created successfully",
      data: {
        _id: expense._id.toString(),
        amount: expense.amount,
        category: expense.category,
        note: expense.note,
        date: expense.date.toISOString(),
        userId: expense.userId.toString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, category, note, date }: UpdateExpenseRequest = req.body;

    // Find expense
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: (req as any).user._id,
    });
    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    // Update fields
    if (amount !== undefined) {
      if (amount <= 0) {
        res.status(400).json({
          success: false,
          message: "Amount must be positive",
        });
        return;
      }
      expense.amount = amount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (note !== undefined) {
      expense.note = note;
    }

    if (date !== undefined) {
      expense.date = new Date(date);
    }

    await expense.save();

    const response: ApiResponse<ExpenseResponse> = {
      success: true,
      message: "Expense updated successfully",
      data: {
        _id: expense._id.toString(),
        amount: expense.amount,
        category: expense.category,
        note: expense.note,
        date: expense.date.toISOString(),
        userId: expense.userId.toString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: (req as any).user._id,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
export const getExpenseStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate }: StatsQueryParams = req.query;

    // Build query
    const query: any = { userId: (req as any).user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get total expenses with count and average
    const totalExpenses = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
    ]);

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Get monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    const stats = totalExpenses[0] || {
      totalAmount: 0,
      totalCount: 0,
      avgAmount: 0,
    };

    const response: ApiResponse<ExpenseStats> = {
      success: true,
      data: {
        total: {
          totalAmount: stats.totalAmount,
          totalCount: stats.totalCount,
          avgAmount: stats.avgAmount,
        },
        categories: expensesByCategory,
        monthlyExpenses,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get expense stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
