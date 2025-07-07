# Expense Tracker API - Next.js Structure

This document describes the API structure that has been migrated from Express.js to Next.js API routes.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Next.js
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## API Endpoints

### Authentication

#### POST `/api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  }
}
```

#### POST `/api/auth/login`

Login with existing credentials.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  }
}
```

### Expenses

#### GET `/api/expenses`

Get all expenses for the authenticated user.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `startDate` (optional): Filter by start date (ISO string)
- `endDate` (optional): Filter by end date (ISO string)
- `sortBy` (optional): Sort field (default: 'date')
- `sortOrder` (optional): Sort order 'asc' or 'desc' (default: 'desc')

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### POST `/api/expenses`

Create a new expense.

**Request Body:**

```json
{
  "amount": 50.0,
  "category": "Food",
  "note": "Lunch at restaurant",
  "date": "2024-01-15T12:00:00Z"
}
```

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### GET `/api/expenses/[id]`

Get a specific expense by ID.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### PUT `/api/expenses/[id]`

Update a specific expense.

**Request Body:**

```json
{
  "amount": 60.0,
  "category": "Food",
  "note": "Updated lunch note",
  "date": "2024-01-15T12:00:00Z"
}
```

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### DELETE `/api/expenses/[id]`

Delete a specific expense.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

### Categories

#### GET `/api/categories`

Get all categories for the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### POST `/api/categories`

Create a new category.

**Request Body:**

```json
{
  "name": "Groceries",
  "description": "Food and household items",
  "color": "#3b82f6"
}
```

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### GET `/api/categories/[id]`

Get a specific category by ID.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### PUT `/api/categories/[id]`

Update a specific category.

**Request Body:**

```json
{
  "name": "Updated Groceries",
  "description": "Updated description",
  "color": "#ef4444"
}
```

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### DELETE `/api/categories/[id]`

Delete a specific category.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

### Health Check

#### GET `/api/health`

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 123.456
}
```

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   └── register/
│   │       └── route.ts
│   ├── categories/
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── expenses/
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── route.ts
│   └── health/
│       └── route.ts
lib/
├── database.ts
├── middleware/
│   └── auth.ts
└── models/
    ├── Category.ts
    ├── Expense.ts
    └── User.ts
middleware.ts
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token is obtained from the login or register endpoints and contains the user ID and email.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `404`: Not Found
- `500`: Internal Server Error

## Database Models

### User

- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `createdAt`: Date
- `updatedAt`: Date

### Expense

- `amount`: Number (required, positive)
- `category`: String (required, enum)
- `note`: String (optional)
- `date`: Date (required)
- `userId`: ObjectId (required, ref to User)
- `createdAt`: Date
- `updatedAt`: Date

### Category

- `name`: String (required, unique per user)
- `description`: String (optional)
- `color`: String (default: "#3b82f6")
- `userId`: ObjectId (required, ref to User)
- `isDefault`: Boolean (default: false)
- `createdAt`: Date
- `updatedAt`: Date
