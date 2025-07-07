import express from "express";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from "../controllers/expenseController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.route("/").get(getExpenses).post(createExpense);

router.route("/stats").get(getExpenseStats);

router.route("/:id").get(getExpense).put(updateExpense).delete(deleteExpense);

export default router;
