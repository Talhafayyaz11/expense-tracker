import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import dotenv from "dotenv"

import { connectDB } from "./config/database"
import { errorHandler } from "./middleware/errorHandler"
import { swaggerOptions } from "./config/swagger"

// Routes
import authRoutes from "./routes/auth"
import expenseRoutes from "./routes/expenses"
import categoryRoutes from "./routes/categories"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Connect to MongoDB
connectDB()

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
)
app.use(morgan("combined"))
app.use(limiter)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Swagger documentation
const specs = swaggerJsdoc(swaggerOptions)
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customSiteTitle: "Expense Tracker API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  }),
)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use("/auth", authRoutes)
app.use("/expenses", expenseRoutes)
app.use("/categories", categoryRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Error handling middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`)
})

export default app
