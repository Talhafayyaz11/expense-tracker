import { Document, Types } from "mongoose";

// User interfaces
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
}

// Category interfaces
export interface ICategory extends Document {
  name: string;
  description?: string;
  color: string;
  userId: Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponse {
  _id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Expense interfaces
export interface IExpense extends Document {
  amount: number;
  category: string;
  note?: string;
  date: Date;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseResponse {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Auth interfaces
export interface AuthRequest {
  name?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpensesResponse {
  expenses: ExpenseResponse[];
  pagination: PaginationResponse;
}

export interface ExpenseStats {
  total: {
    totalAmount: number;
    totalCount: number;
    avgAmount: number;
  };
  categories: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  monthlyExpenses: Array<{
    _id: {
      year: number;
      month: number;
    };
    total: number;
    count: number;
  }>;
}

// Request interfaces
export interface CreateExpenseRequest {
  amount: number;
  category: string;
  note?: string;
  date: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  category?: string;
  note?: string;
  date?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
}

// Express request with user
export interface AuthenticatedRequest extends Request {
  user: IUser;
}

// Query parameters
export interface ExpenseQueryParams {
  page?: string;
  limit?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface StatsQueryParams {
  startDate?: string;
  endDate?: string;
}
