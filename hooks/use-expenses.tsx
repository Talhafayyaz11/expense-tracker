"use client";

import { useState, useEffect } from "react";
import { apiClient, type ExpensesResponse, type ExpenseStats } from "@/lib/api";

export function useExpenses(params?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<ExpensesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getExpenses(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch expenses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [
    params?.category,
    params?.startDate,
    params?.endDate,
    params?.minAmount,
    params?.maxAmount,
    params?.page,
    params?.limit,
  ]);

  const createExpense = async (expenseData: {
    amount: number;
    category: string;
    note?: string;
    date: string;
  }) => {
    try {
      await apiClient.createExpense(expenseData);
      await fetchExpenses(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const updateExpense = async (
    id: string,
    expenseData: Partial<{
      amount: number;
      category: string;
      note?: string;
      date: string;
    }>
  ) => {
    try {
      await apiClient.updateExpense(id, expenseData);
      await fetchExpenses(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await apiClient.deleteExpense(id);
      await fetchExpenses(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  return {
    expenses: data?.expenses || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch: fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}

export function useExpenseStats(startDate?: string, endDate?: string) {
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getExpenseStats(startDate, endDate);
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  return { stats, isLoading, error, refetch: fetchStats };
}
