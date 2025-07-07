import express from "express"
import Expense from "../models/Expense"
import { authenticate, type AuthRequest } from "../middleware/auth"
import { validate, expenseSchema, updateExpenseSchema, queryExpensesSchema } from "../middleware/validation"
import { asyncHandler } from "../middleware/errorHandler"

const router = express.Router()

// Apply authentication to all routes
router.use(authenticate)

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 45.99
 *               category:
 *                 type: string
 *                 enum: [Food, Bills, Transport, Shopping, Entertainment, Healthcare, Education, Travel, Other]
 *                 example: Food
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: Lunch at restaurant
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T12:30:00.000Z
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  validate(expenseSchema),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const expense = await Expense.create({
      ...req.body,
      userId: req.user!._id,
    })

    res.status(201).json({
      success: true,
      expense,
    })
  }),
)

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses with pagination and filtering
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Food, Bills, Transport, Shopping, Entertainment, Healthcare, Education, Travel, Other]
 *         description: Filter by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { error, value } = queryExpensesSchema.validate(req.query)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      })
    }

    const { category, startDate, endDate, page, limit } = value

    // Build filter
    const filter: any = { userId: req.user!._id }

    if (category) {
      filter.category = category
    }

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(filter),
    ])

    res.json({
      success: true,
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  }),
)

/**
 * @swagger
 * /expenses/stats:
 *   get:
 *     summary: Get expense statistics
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: object
 *                   properties:
 *                     totalAmount:
 *                       type: number
 *                       example: 1250.75
 *                     totalCount:
 *                       type: number
 *                       example: 15
 *                     avgAmount:
 *                       type: number
 *                       example: 83.38
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: Food
 *                       totalAmount:
 *                         type: number
 *                         example: 450.25
 *                       count:
 *                         type: number
 *                         example: 8
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/stats",
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { startDate, endDate } = req.query

    // Build filter
    const filter: any = { userId: req.user!._id }

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate as string)
      if (endDate) filter.date.$lte = new Date(endDate as string)
    }

    const [totalStats, categoryStats] = await Promise.all([
      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalCount: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
          },
        },
      ]),
      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),
    ])

    res.json({
      success: true,
      total: totalStats[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 },
      categories: categoryStats,
    })
  }),
)

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user!._id })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      })
    }

    res.json({
      success: true,
      expense,
    })
  }),
)

/**
 * @swagger
 * /expenses/{id}:
 *   patch:
 *     summary: Update expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 50.0
 *               category:
 *                 type: string
 *                 enum: [Food, Bills, Transport, Shopping, Entertainment, Healthcare, Education, Travel, Other]
 *                 example: Food
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated lunch expense
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T12:30:00.000Z
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id",
  validate(updateExpenseSchema),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user!._id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      })
    }

    res.json({
      success: true,
      expense,
    })
  }),
)

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Expense deleted successfully
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user!._id })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      })
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
    })
  }),
)

export default router
