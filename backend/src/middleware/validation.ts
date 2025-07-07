import type { Request, Response, NextFunction } from "express"
import Joi from "joi"

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      })
    }

    next()
  }
}

// Validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const expenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  category: Joi.string()
    .valid("Food", "Bills", "Transport", "Shopping", "Entertainment", "Healthcare", "Education", "Travel", "Other")
    .required(),
  note: Joi.string().trim().max(500).optional(),
  date: Joi.date().iso().required(),
})

export const updateExpenseSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  category: Joi.string()
    .valid("Food", "Bills", "Transport", "Shopping", "Entertainment", "Healthcare", "Education", "Travel", "Other")
    .optional(),
  note: Joi.string().trim().max(500).optional(),
  date: Joi.date().iso().optional(),
})

export const queryExpensesSchema = Joi.object({
  category: Joi.string()
    .valid("Food", "Bills", "Transport", "Shopping", "Entertainment", "Healthcare", "Education", "Travel", "Other")
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
})
