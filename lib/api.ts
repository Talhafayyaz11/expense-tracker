const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

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
    totalPages: number;
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
  data?: T;
}

interface AuthBackendResponse extends BackendResponse<AuthResponse> {
  data: {
    user: User;
    token: string;
  };
}

interface ExpensesBackendResponse extends BackendResponse<ExpensesResponse> {
  data: {
    expenses: Expense[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ExpenseBackendResponse extends BackendResponse<Expense> {
  data: Expense;
}

interface CategoriesBackendResponse extends BackendResponse<Category[]> {
  data: Category[];
}

interface CategoryBackendResponse extends BackendResponse<Category> {
  data: Category;
}

interface StatsBackendResponse extends BackendResponse<ExpenseStats> {
  data: {
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
  };
}

interface MessageBackendResponse extends BackendResponse<{ message: string }> {
  message: string;
}

// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
};

const removeLocalStorage = (key: string): void => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(key);
  }
};

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage on client side
    this.token = getLocalStorage("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    setLocalStorage("auth_token", token);
  }

  clearToken() {
    this.token = null;
    removeLocalStorage("auth_token");
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
    return response.data!;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthBackendResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  // Expense endpoints
  async getExpenses(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ExpensesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.category) searchParams.append("category", params.category);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `/expenses${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<ExpensesBackendResponse>(endpoint);
    return response.data!;
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
    return response.data!;
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
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async deleteExpense(id: string): Promise<{ message: string }> {
    const response = await this.request<MessageBackendResponse>(
      `/expenses/${id}`,
      {
        method: "DELETE",
      }
    );
    return { message: response.message! };
  }

  async getExpenseStats(
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseStats> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);

    const queryString = searchParams.toString();
    const endpoint = `/expenses/stats${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<StatsBackendResponse>(endpoint);
    return response.data!;
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await this.request<CategoriesBackendResponse>(
      "/categories"
    );
    return response.data!;
  }

  async createCategory(data: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<Category> {
    const response = await this.request<CategoryBackendResponse>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      color: string;
    }>
  ): Promise<Category> {
    const response = await this.request<CategoryBackendResponse>(
      `/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await this.request<MessageBackendResponse>(
      `/categories/${id}`,
      {
        method: "DELETE",
      }
    );
    return { message: response.message! };
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
