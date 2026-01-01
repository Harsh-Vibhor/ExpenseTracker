# 🚀 ExpenseTracker - Quick Start Guide

Welcome to ExpenseTracker! This guide will help you get the application up and running in minutes.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Default Login Credentials](#default-login-credentials)
6. [Troubleshooting](#troubleshooting)
7. [Important Security Notes](#important-security-notes)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (v16 or higher)
  - Download: https://nodejs.org/
  - Verify installation: `node --version`

- **MySQL** (v8 or higher)
  - Download: https://dev.mysql.com/downloads/mysql/
  - Verify installation: `mysql --version`

- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

### Optional but Recommended

- **Git** - For version control
- **MySQL Workbench** - For database management
- **Postman** - For API testing

---

## 🎯 Project Overview

ExpenseTracker is a full-stack web application for managing personal and organizational expenses.

**Architecture:**
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)

**Key Features:**
- User and Admin dashboards
- Expense CRUD operations
- Analytics and charts
- Advanced filtering and search
- Role-based access control

---

## 🗄️ Database Setup

### Step 1: Start MySQL Server

Ensure MySQL is running on your system:

**Windows:**
```bash
net start MySQL
```

**macOS:**
```bash
mysql.server start
```

**Linux:**
```bash
sudo systemctl start mysql
```

### Step 2: Create Database

Open MySQL command line:

```bash
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE expense_tracker;
EXIT;
```

### Step 3: Run Schema File

Navigate to the project root and run the schema file:

**Option 1: From command line**
```bash
mysql -u root -p expense_tracker < backend/database/schema.sql
```

**Option 2: From MySQL shell**
```bash
mysql -u root -p
USE expense_tracker;
SOURCE backend/database/schema.sql;
EXIT;
```

This will:
- Create all tables (users, categories, expenses)
- Insert 10 default categories
- Insert default admin and user accounts

### Step 4: Verify Database Setup

Login to MySQL and verify:

```bash
mysql -u root -p expense_tracker
```

```sql
-- Check tables
SHOW TABLES;

-- Should show: categories, expenses, users

-- Check default users
SELECT id, name, email, role FROM users;

-- Should show admin and test user

-- Check categories
SELECT * FROM categories;

-- Should show 10 default categories

EXIT;
```

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express (web framework)
- MySQL2 (database driver)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- dotenv (environment variables)

### Step 3: Configure Environment Variables

The `.env` file should already exist in the `backend` directory. Update it with your MySQL credentials:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=expense_tracker

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=1d
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password.

### Step 4: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
Server running on port 4000
Database connected successfully
```

The backend API is now running at: **http://localhost:4000**

---

## 💻 Frontend Setup

### Step 1: Open New Terminal

Keep the backend server running and open a new terminal window.

### Step 2: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- React (UI library)
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (charts)
- React Router (routing)
- Axios (HTTP client)

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The frontend is now running at: **http://localhost:5173**

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the ExpenseTracker login page!

---

## 🔑 Default Login Credentials

Use these credentials to log in and explore the application:

### Admin Account

```
Email:    admin@expensetracker.com
Password: admin123
```

**Admin Features:**
- View all users
- View all expenses across the platform
- Platform-wide analytics
- Category performance metrics

### User Account

```
Email:    user@expensetracker.com
Password: user123
```

**User Features:**
- Create, edit, delete personal expenses
- View personal dashboard with charts
- Filter and search expenses
- Category-wise expense tracking

---

## 🔍 Troubleshooting

### Backend Issues

**Problem:** `Error: connect ECONNREFUSED`
- **Solution:** Make sure MySQL is running
- Check MySQL service: `mysql.server status` (Mac) or `net start MySQL` (Windows)

**Problem:** `Access denied for user 'root'@'localhost'`
- **Solution:** Check your MySQL password in `.env` file
- Verify credentials: `mysql -u root -p`

**Problem:** `Database 'expense_tracker' does not exist`
- **Solution:** Run `npm run init-db` to create the database

**Problem:** `Table 'users' doesn't exist`
- **Solution:** Run `npm run init-db` to create tables

### Frontend Issues

**Problem:** `Failed to fetch` or API errors
- **Solution:** Ensure backend is running on port 4000
- Check `frontend/src/api/axios.js` has correct baseURL

**Problem:** Port 5173 already in use
- **Solution:** Kill the process or use a different port
- Kill process: `lsof -ti:5173 | xargs kill` (Mac/Linux)

**Problem:** Login not working
- **Solution:** Ensure you've run `npm run seed` to create users
- Check browser console for errors

---

## ⚠️ Important Security Notes

### For Development

✅ The default credentials are fine for local development and testing.

### For Production

🚨 **CRITICAL:** Before deploying to production:

1. **Change Default Passwords**
   ```sql
   -- Connect to MySQL
   mysql -u root -p expense_tracker
   
   -- Delete default users
   DELETE FROM users WHERE email IN ('admin@expensetracker.com', 'user@expensetracker.com');
   
   -- Create new users with strong passwords via the application
   ```

2. **Update JWT Secret**
   - Generate a strong random secret: `openssl rand -base64 32`
   - Update `JWT_SECRET` in `.env`

3. **Secure Database**
   - Use a dedicated database user (not root)
   - Use strong database password
   - Restrict database access to localhost or specific IPs

4. **Environment Variables**
   - Never commit `.env` file to version control
   - Use environment-specific configurations
   - Use secrets management in production

5. **HTTPS**
   - Always use HTTPS in production
   - Configure SSL/TLS certificates

---

## 🎉 You're All Set!

Your ExpenseTracker application is now running!

**Next Steps:**
1. Log in with the default credentials
2. Explore the user dashboard
3. Create some test expenses
4. Try the admin dashboard
5. Experiment with filters and charts

**Need Help?**
- Check the main [README.md](README.md) for detailed documentation
- Review the API endpoints in the README
- Check the code comments for implementation details

---

**Happy Expense Tracking! 💰📊**

