# EMS - Enterprise HR Management System

A modern, full-stack HR management platform built with React, Node.js, and PostgreSQL.

## Features

- 🔐 **Authentication** - JWT with refresh token rotation, account lockout
- 👥 **Employee Management** - Full lifecycle from hire to retire
- 📊 **RBAC** - Role-based access with granular permissions
- ⏰ **Attendance** - Shift-based tracking with overtime calculation
- 📅 **Leave Management** - Policy engine with auto-approval
- 🏗️ **Multi-tenant** - Organization isolation built-in

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your DATABASE_URL

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Access

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Demo Login**: admin@acme.com / Admin123!

## Project Structure

```
├── backend/
│   ├── prisma/          # Database schema & seed
│   └── src/
│       ├── middleware/  # Auth, error handling
│       └── modules/     # Feature modules
│
└── frontend/
    └── src/
        ├── components/  # UI components
        ├── pages/       # Route pages
        └── store/       # State management
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |

## API Endpoints

| Module | Base Path |
|--------|-----------|
| Auth | `/api/auth` |
| Organization | `/api/organizations` |
| Employees | `/api/employees` |
| RBAC | `/api/rbac` |
| Attendance | `/api/attendance` |
| Leave | `/api/leave` |

## License

MIT
