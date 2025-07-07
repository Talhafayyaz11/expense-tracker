# Expense Tracker Backend API

A RESTful API for the Expense Tracker application built with Express.js and MongoDB.

## Features

- User authentication with JWT
- CRUD operations for expenses and categories
- Expense statistics and analytics
- Rate limiting and security middleware
- MongoDB integration with Mongoose

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp env.example .env
```

3. Configure environment variables in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### POST /api/auth/register

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login

Login user.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me

Get current user information (requires authentication).

### Expenses

#### GET /api/expenses

Get all expenses with pagination and filtering.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `sortBy` (optional): Sort field (default: "date")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

#### POST /api/expenses

Create a new expense.

**Request Body:**

```json
{
  "amount": 50.0,
  "category": "Food",
  "note": "Lunch at restaurant",
  "date": "2024-01-15"
}
```

#### GET /api/expenses/:id

Get a specific expense.

#### PUT /api/expenses/:id

Update an expense.

#### DELETE /api/expenses/:id

Delete an expense.

#### GET /api/expenses/stats

Get expense statistics.

**Query Parameters:**

- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics

### Categories

#### GET /api/categories

Get all categories for the current user.

#### POST /api/categories

Create a new category.

**Request Body:**

```json
{
  "name": "Entertainment",
  "description": "Movies, games, and leisure activities",
  "color": "#8b5cf6"
}
```

#### GET /api/categories/:id

Get a specific category.

#### PUT /api/categories/:id

Update a category.

#### DELETE /api/categories/:id

Delete a category.

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Success Responses

All success responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Database Schema

### User

- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `createdAt`: Date
- `updatedAt`: Date

### Category

- `name`: String (required)
- `description`: String (optional)
- `color`: String (hex color)
- `userId`: ObjectId (reference to User)
- `isDefault`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

### Expense

- `amount`: Number (required)
- `category`: String (required)
- `note`: String (optional)
- `date`: Date (required)
- `userId`: ObjectId (reference to User)
- `createdAt`: Date
- `updatedAt`: Date
