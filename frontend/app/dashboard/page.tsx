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
import { ProtectedRoute } from "@/components/protected-route";

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

function DashboardContent() {
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
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}! Here's your expense overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Error Display */}
        {(expensesError || statsError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{expensesError || statsError}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SmoothLoadingCard isLoading={statsLoading}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total?.totalAmount
                    ? formatCurrency(stats.total.totalAmount)
                    : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.total?.totalCount || 0} transactions
                </p>
              </CardContent>
            </Card>
          </SmoothLoadingCard>

          <SmoothLoadingCard isLoading={statsLoading}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Expense
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total?.avgAmount
                    ? formatCurrency(stats.total.avgAmount)
                    : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>
          </SmoothLoadingCard>

          <SmoothLoadingCard isLoading={statsLoading}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categories Used
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.categories?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Different categories
                </p>
              </CardContent>
            </Card>
          </SmoothLoadingCard>

          <SmoothLoadingCard isLoading={expensesLoading}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenses.length}</div>
                <p className="text-xs text-muted-foreground">
                  Expenses recorded
                </p>
              </CardContent>
            </Card>
          </SmoothLoadingCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SmoothLoadingCard isLoading={statsLoading}>
            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>
                  Your spending patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseChart expenses={expenses} />
              </CardContent>
            </Card>
          </SmoothLoadingCard>

          <SmoothLoadingCard isLoading={statsLoading}>
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart categories={stats?.categories || []} />
              </CardContent>
            </Card>
          </SmoothLoadingCard>
        </div>

        {/* Filters and Expenses Table */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>
                    Your latest expense transactions
                  </CardDescription>
                </div>
                <ExpenseFilters
                  categories={categoryNames}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <SmoothLoadingCard isLoading={expensesLoading}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              categoryColors[
                                expense.category as keyof typeof categoryColors
                              ] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expense.note || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SmoothLoadingCard>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EditExpenseDialog
        expense={editingExpense}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateExpense={handleUpdateExpense}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteExpense}
        title="Delete Expense"
        description={`Are you sure you want to delete the expense "${
          deletingExpense?.note || deletingExpense?.category
        }" for ${
          deletingExpense ? formatCurrency(deletingExpense.amount) : ""
        }?`}
        isLoading={isDeletingExpense}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
