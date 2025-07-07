# Expense Tracker - Next.js Setup Guide

This guide will help you set up the Expense Tracker application with the new Next.js API structure.

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)

   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/expense-tracker

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here

   # Next.js
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000
   ```

   **Important:** Replace the placeholder values with your actual configuration:

   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key for JWT tokens (use a random string)
   - `NEXTAUTH_SECRET`: Another strong secret key for NextAuth
   - `NEXTAUTH_URL`: Your application URL (use `http://localhost:3000` for development)

4. **Start MongoDB**

   If using local MongoDB:

   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

   Or use MongoDB Atlas (cloud):

   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and update `MONGODB_URI`

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

The application now uses Next.js API routes instead of a separate Express.js server. All API endpoints are available at `/api/*`:

- **Authentication**: `/api/auth/register`, `/api/auth/login`
- **Expenses**: `/api/expenses`, `/api/expenses/[id]`
- **Categories**: `/api/categories`, `/api/categories/[id]`
- **Health Check**: `/api/health`

## Features

### ✅ **Completed**

- User authentication (register/login)
- Expense management (CRUD operations)
- Category management
- Dashboard with charts and statistics
- Protected routes
- Responsive design
- TypeScript support

### 🔧 **Key Improvements**

- **Unified Architecture**: No separate backend server needed
- **Better Performance**: API routes run on the same server as the frontend
- **Simplified Deployment**: Single application to deploy
- **Type Safety**: Full TypeScript support throughout
- **Modern UI**: Beautiful, responsive interface with shadcn/ui components

## Development

### Project Structure

```
expense-tracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── add-expense/       # Add expense page
│   └── layout.tsx         # Root layout
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── api.ts            # API client
│   ├── database.ts       # Database connection
│   ├── models/           # Mongoose models
│   └── middleware/       # Authentication middleware
└── middleware.ts         # Next.js middleware
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env.local`
   - Verify network connectivity

2. **JWT Errors**

   - Make sure `JWT_SECRET` is set in `.env.local`
   - Use a strong, random secret key

3. **TypeScript Errors**

   - Run `npm install` to ensure all dependencies are installed
   - Check that `tsconfig.json` includes DOM types

4. **API Routes Not Working**
   - Ensure you're using the correct API paths (`/api/*`)
   - Check browser network tab for errors
   - Verify authentication headers are being sent

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Review the terminal output for server errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
