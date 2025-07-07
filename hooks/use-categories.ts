"use client";

import { useState, useEffect } from "react";
import { apiClient, type Category } from "@/lib/api";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getCategories();
      setCategories(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (categoryData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    try {
      await apiClient.createCategory(categoryData);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: Partial<{
      name: string;
      description: string;
      color: string;
    }>
  ) => {
    try {
      await apiClient.updateCategory(id, categoryData);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiClient.deleteCategory(id);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
