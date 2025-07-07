const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Expense {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backend response wrapper types
interface BackendResponse<T> {
  success: boolean;
  message?: string;
}

interface AuthBackendResponse extends BackendResponse<AuthResponse> {
  user: User;
  token: string;
}

interface ExpensesBackendResponse extends BackendResponse<ExpensesResponse> {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ExpenseBackendResponse extends BackendResponse<Expense> {
  expense: Expense;
}

interface CategoriesBackendResponse extends BackendResponse<Category[]> {
  categories: Category[];
}

interface StatsBackendResponse extends BackendResponse<ExpenseStats> {
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
}

interface MessageBackendResponse extends BackendResponse<{ message: string }> {
  message: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add custom headers if provided
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as any).message || `HTTP error! status: ${response.status}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthBackendResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { user: response.user, token: response.token };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthBackendResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { user: response.user, token: response.token };
  }

  // Expense endpoints
  async getExpenses(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ExpensesResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    const response = await this.request<ExpensesBackendResponse>(
      `/expenses${query ? `?${query}` : ""}`
    );
    return { expenses: response.expenses, pagination: response.pagination };
  }

  async createExpense(data: {
    amount: number;
    category: string;
    note?: string;
    date: string;
  }): Promise<Expense> {
    const response = await this.request<ExpenseBackendResponse>("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.expense;
  }

  async updateExpense(
    id: string,
    data: Partial<{
      amount: number;
      category: string;
      note?: string;
      date: string;
    }>
  ): Promise<Expense> {
    const response = await this.request<ExpenseBackendResponse>(
      `/expenses/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return response.expense;
  }

  async deleteExpense(id: string): Promise<{ message: string }> {
    const response = await this.request<MessageBackendResponse>(
      `/expenses/${id}`,
      {
        method: "DELETE",
      }
    );
    return { message: response.message };
  }

  async getExpenseStats(
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseStats> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);

    const query = searchParams.toString();
    const response = await this.request<StatsBackendResponse>(
      `/expenses/stats${query ? `?${query}` : ""}`
    );
    return { total: response.total, categories: response.categories };
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await this.request<CategoriesBackendResponse>(
      "/categories"
    );
    return response.categories;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
