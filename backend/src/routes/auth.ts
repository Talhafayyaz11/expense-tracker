import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"
import Category from "../models/Category"
import { validate, registerSchema, loginSchema } from "../middleware/validation"
import { asyncHandler } from "../middleware/errorHandler"

const router = express.Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Create user
    const user = await User.create({ name, email, password })

    // Create default categories for the user
    const defaultCategories = [
      { name: "Food", color: "#f97316", description: "Food and dining expenses", userId: user._id, isDefault: true },
      {
        name: "Bills",
        color: "#ef4444",
        description: "Utility bills and subscriptions",
        userId: user._id,
        isDefault: true,
      },
      { name: "Transport", color: "#3b82f6", description: "Transportation costs", userId: user._id, isDefault: true },
      {
        name: "Shopping",
        color: "#22c55e",
        description: "Shopping and retail purchases",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Entertainment",
        color: "#8b5cf6",
        description: "Entertainment and leisure",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Healthcare",
        color: "#06b6d4",
        description: "Medical and health expenses",
        userId: user._id,
        isDefault: true,
      },
      { name: "Education", color: "#f59e0b", description: "Educational expenses", userId: user._id, isDefault: true },
      { name: "Travel", color: "#ec4899", description: "Travel and vacation costs", userId: user._id, isDefault: true },
    ]

    await Category.insertMany(defaultCategories)

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  }),
)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body

    // Find user and include password
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  }),
)

export default router
