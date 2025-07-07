# Expense Tracker Backend

Express.js backend API for the expense tracker application with MongoDB, JWT authentication, and comprehensive expense management.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 💰 **Expense Management** - Full CRUD operations for expenses
- 📊 **Categories** - Predefined expense categories with colors
- 📈 **Analytics** - Statistics and aggregation for insights
- 🔍 **Advanced Filtering** - Filter by date range, category, pagination
- 📚 **API Documentation** - Complete Swagger documentation
- 🛡️ **Security** - Rate limiting, CORS, input validation

## Tech Stack

- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **TypeScript** - Type safety
- **JWT** - Authentication tokens
- **Joi** - Input validation
- **Swagger** - API documentation
- **bcryptjs** - Password hashing

## Quick Start

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment setup**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **View API documentation**
   \`\`\`
   http://localhost:3001/api/docs
   \`\`\`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Expenses
- `GET /expenses` - List expenses (with filtering/pagination)
- `POST /expenses` - Create expense
- `GET /expenses/stats` - Get statistics
- `GET /expenses/:id` - Get single expense
- `PATCH /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Categories
- `GET /categories` - List user categories
- `GET /categories/:id` - Get single category

### Utilities
- `GET /health` - Health check
- `GET /api/docs` - Swagger documentation

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

\`\`\`env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
\`\`\`

## Project Structure

\`\`\`
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript
└── package.json
