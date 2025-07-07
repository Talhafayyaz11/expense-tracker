import type { Options } from "swagger-jsdoc"

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: `
        ## Expense Tracker API Documentation
        
        A comprehensive RESTful API for managing personal expenses with user authentication,
        expense tracking, categorization, and analytics.
        
        ### Features
        - 🔐 **User Authentication**: Secure JWT-based authentication
        - 💰 **Expense Management**: Full CRUD operations for expenses
        - 📊 **Categories**: Predefined and custom expense categories
        - 📈 **Analytics**: Statistics and reporting capabilities
        - 🔍 **Advanced Filtering**: Filter by date range, category, and more
        - 📄 **Pagination**: Efficient data retrieval with pagination
        
        ### Authentication
        Most endpoints require authentication. After logging in, include the JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
      `,
      contact: {
        name: "API Support",
        url: "https://expense-tracker.com/support",
        email: "support@expense-tracker.com",
      },
      license: {
        name: "MIT License",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
      {
        url: "https://api.expense-tracker.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token (without Bearer prefix)",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Expense: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            amount: { type: "number", example: 45.99 },
            category: { type: "string", example: "Food" },
            note: { type: "string", example: "Lunch at restaurant" },
            date: { type: "string", format: "date-time" },
            userId: { type: "string", example: "507f1f77bcf86cd799439010" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "Food" },
            description: { type: "string", example: "Food and dining expenses" },
            color: { type: "string", example: "#f97316" },
            userId: { type: "string", example: "507f1f77bcf86cd799439010" },
            isDefault: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
            statusCode: { type: "number", example: 400 },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User registration and login endpoints" },
      { name: "Expenses", description: "Expense management operations" },
      { name: "Categories", description: "Category management operations" },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API files
}
