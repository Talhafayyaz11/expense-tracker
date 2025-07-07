# Expense Tracker

A full-stack expense tracking application built with Next.js frontend and Express.js backend.

## Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing
- Protected routes

### 💰 Expense Management
- Add, edit, and delete expenses
- Categorize expenses (Food, Bills, Transport, etc.)
- Add notes and dates to expenses
- Real-time expense tracking

### 📊 Analytics & Insights
- Monthly expense totals
- Category-wise breakdown
- Interactive charts and graphs
- Expense statistics and averages

### 🎨 User Experience
- Responsive design for all devices
- Intuitive dashboard
- Real-time data updates
- Form validation and error handling

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **React Context** - State management

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Joi** - Input validation
- **Swagger** - API documentation

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB running locally or MongoDB Atlas

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd expense-tracker
\`\`\`

### 2. Setup Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
\`\`\`

### 3. Setup Frontend
\`\`\`bash
# In project root
npm install
npm run dev
\`\`\`

### 4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## Project Structure

\`\`\`
expense-tracker/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Database & Swagger config
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── server.ts       # Main server file
│   └── package.json
├── app/                    # Next.js pages
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and API client
└── package.json
\`\`\`

## Environment Variables

### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
\`\`\`

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Expenses
- `GET /expenses` - List expenses with filtering/pagination
- `POST /expenses` - Create new expense
- `GET /expenses/stats` - Get expense statistics
- `GET /expenses/:id` - Get single expense
- `PATCH /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Categories
- `GET /categories` - List user categories
- `GET /categories/:id` - Get single category

## Development

### Backend Development
\`\`\`bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
\`\`\`

### Frontend Development
\`\`\`bash
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
\`\`\`

## Features in Detail

### Dashboard
- Overview of monthly expenses
- Category breakdown with percentages
- Interactive charts showing trends
- Recent transactions table

### Add Expense
- Form with amount, category, date, and notes
- Real-time preview
- Category selection with colors
- Form validation

### Authentication
- Secure registration and login
- JWT token management
- Automatic session persistence
- Protected route handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
