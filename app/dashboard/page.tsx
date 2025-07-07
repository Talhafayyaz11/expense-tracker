"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  LogOut,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useExpenses, useExpenseStats } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { ExpenseChart } from "@/components/expense-chart";
import { CategoryChart } from "@/components/category-chart";
import {
  ExpenseFilters,
  type ExpenseFilters as ExpenseFiltersType,
} from "@/components/expense-filters";
import {
  EditExpenseDialog,
  type Expense,
} from "@/components/edit-expense-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { SmoothLoading, SmoothLoadingCard } from "@/components/smooth-loading";
import { useToast } from "@/hooks/use-toast";

const categoryColors = {
  Food: "bg-orange-100 text-orange-800",
  Bills: "bg-red-100 text-red-800",
  Transport: "bg-blue-100 text-blue-800",
  Shopping: "bg-green-100 text-green-800",
  Entertainment: "bg-purple-100 text-purple-800",
  Healthcare: "bg-cyan-100 text-cyan-800",
  Education: "bg-yellow-100 text-yellow-800",
  Travel: "bg-pink-100 text-pink-800",
  Other: "bg-gray-100 text-gray-800",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [selectedMonth] = useState("January 2024");
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);

  // Get current month date range
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).toISOString();

  // Use filters if provided, otherwise use current month
  const effectiveFilters = {
    startDate: filters.startDate || startOfMonth,
    endDate: filters.endDate || endOfMonth,
    category: filters.category,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    limit: 10,
  };

  const {
    expenses,
    isLoading: expensesLoading,
    error: expensesError,
    deleteExpense,
    updateExpense,
  } = useExpenses(effectiveFilters);

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useExpenseStats(effectiveFilters.startDate, effectiveFilters.endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleUpdateExpense = async (
    id: string,
    expenseData: Partial<{
      amount: number;
      category: string;
      note?: string;
      date: string;
    }>
  ) => {
    setIsUpdatingExpense(true);
    try {
      await updateExpense(id, expenseData);
      // Also refresh stats to update charts and summary cards
      await refetchStats();
    } catch (err) {
      throw err;
    } finally {
      setIsUpdatingExpense(false);
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteExpense = async () => {
    if (!deletingExpense) return;

    setIsDeletingExpense(true);
    try {
      await deleteExpense(deletingExpense._id);
      // Also refresh stats to update charts and summary cards
      await refetchStats();
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setIsDeletingExpense(false);
      setDeletingExpense(null);
    }
  };

  const handleFiltersChange = (newFilters: ExpenseFiltersType) => {
    // Only update if filters actually changed
    if (JSON.stringify(filters) !== JSON.stringify(newFilters)) {
      setFilters(newFilters);
    }
  };

  const categoryNames = categories.map((cat) => cat.name);

  // Show initial loading only on first load, not on filter changes
  if (expensesLoading && expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">Track and manage your expenses</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/add-expense">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Messages */}
        {(expensesError || statsError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{expensesError || statsError}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <SmoothLoadingCard isLoading={isUpdatingExpense || isDeletingExpense}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.total.totalAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{selectedMonth}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total.totalCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average per Transaction
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.total.avgAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Average amount</p>
              </CardContent>
            </Card>
          </div>
        </SmoothLoadingCard>

        {/* Charts */}
        <SmoothLoadingCard isLoading={isUpdatingExpense || isDeletingExpense}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>Daily expense tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseChart expenses={expenses} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart categories={stats?.categories || []} />
              </CardContent>
            </Card>
          </div>
        </SmoothLoadingCard>

        {/* Category Summary */}
        {stats?.categories && stats.categories.length > 0 && (
          <SmoothLoadingCard isLoading={isUpdatingExpense || isDeletingExpense}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Category Summary</CardTitle>
                <CardDescription>
                  Breakdown of expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats?.categories?.map((category) => (
                    <div
                      key={category._id}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-lg font-semibold">
                        {formatCurrency(category.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {category._id}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(
                          (category.totalAmount /
                            (stats.total.totalAmount || 1)) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SmoothLoadingCard>
        )}

        {/* Recent Expenses */}
        <SmoothLoadingCard isLoading={expensesLoading}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
              <ExpenseFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categoryNames}
                isLoading={expensesLoading}
              />
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No expenses found for this period.
                  </p>
                  <Link href="/add-expense">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Expense
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell className="font-medium">
                          {formatDate(expense.date)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              categoryColors[
                                expense.category as keyof typeof categoryColors
                              ] || categoryColors.Other
                            }
                          >
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expense.note || "No description"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                              disabled={isUpdatingExpense || isDeletingExpense}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense)}
                              className="text-red-600 hover:text-red-700"
                              disabled={isUpdatingExpense || isDeletingExpense}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </SmoothLoadingCard>

        {/* Edit Expense Dialog */}
        <EditExpenseDialog
          expense={editingExpense}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateExpense={handleUpdateExpense}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteExpense}
          title="Delete Expense"
          description={`Are you sure you want to delete the expense "${
            deletingExpense?.note ||
            `${deletingExpense?.category} - $${deletingExpense?.amount}`
          }"? This action cannot be undone.`}
          isLoading={isDeletingExpense}
        />
      </div>
    </div>
  );
}
