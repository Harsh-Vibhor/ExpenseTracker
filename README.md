# ExpenseTracker

A full-stack expense tracking application with role-based access control, analytics dashboards, and comprehensive expense management features.

## 📋 Overview

ExpenseTracker is a modern web application designed to help users track and manage their personal expenses efficiently. The application features separate dashboards for regular users and administrators, with real-time analytics, interactive charts, and powerful filtering capabilities.

## ✨ Features

### Authentication & Authorization
- **Secure Login System** - JWT-based authentication
- **Role-Based Access Control** - Separate USER and ADMIN roles
- **Protected Routes** - Automatic redirection based on user role

### User Features
- **Expense Management**
  - Create, read, update, and delete expenses
  - Categorize expenses with predefined or custom categories
  - Add descriptions and dates to expenses
  - Real-time expense tracking

- **Advanced Filtering & Search**
  - Search expenses by description or category
  - Filter by category
  - Filter by date range (from/to)
  - Debounced search for better performance
  - Combined filters with AND logic

- **Pagination**
  - 10 expenses per page
  - Smart page navigation with Previous/Next buttons
  - Direct page number selection
  - Automatic reset to page 1 on filter changes

- **Dashboard Analytics**
  - Total expense tracking (all-time)
  - Monthly expense summary
  - Active categories count
  - Recent transactions overview
  - Monthly expense trend chart (Area Chart)
  - Category breakdown chart (Pie Chart)

### Admin Features
- **Platform-Wide Analytics**
  - Total registered users
  - Total expenses across all users
  - Total transactions count
  - Category-wise spending analysis (Bar Chart)

- **Global Insights**
  - View all user expenses
  - Monitor platform usage
  - Category performance metrics

### UI/UX Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Loading States** - Skeleton loaders for better perceived performance
- **Empty States** - Helpful messages when no data is available
- **Error Handling** - Clear error messages for API failures
- **Modern UI** - Clean, professional design with Tailwind CSS
- **Interactive Charts** - Powered by Recharts library
- **Smooth Animations** - Hover effects and transitions

## 🛠️ Tech Stack

### Frontend
- **React** (v18) - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & role middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── auth/            # Auth context & provider
│   │   ├── components/      # Reusable components
│   │   ├── layouts/         # Layout components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── index.html
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=4000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=expense_tracker
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up the database**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE expense_tracker;
   exit;

   # Run migrations (if available) or import schema
   # The app will create tables automatically on first run
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (optional)
   Update `frontend/src/api/axios.js` if your backend runs on a different port:
   ```javascript
   baseURL: 'http://localhost:4000/api'
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 👤 Default Users

After setting up the database, you can create users via the registration endpoint or manually insert them:

**Admin User:**
```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@example.com', '$2b$10$hashedpassword', 'ADMIN');
```

**Regular User:**
```sql
INSERT INTO users (name, email, password, role)
VALUES ('John Doe', 'user@example.com', '$2b$10$hashedpassword', 'USER');
```

> **Note:** Use bcrypt to hash passwords before inserting them into the database.

## 📸 Screenshots

### Login Page
![Login Page](./screenshots/login.png)
*Clean, modern login interface with illustration*

### User Dashboard
![User Dashboard](./screenshots/user-dashboard.png)
*Analytics dashboard with KPI cards and interactive charts*

### Expense Management
![Expense Management](./screenshots/expenses.png)
*Comprehensive expense CRUD with filters and pagination*

### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)
*Platform-wide analytics and insights*

> **Note:** Screenshots are placeholders. Add actual screenshots to the `screenshots/` directory.

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Endpoints (Protected)
- `GET /api/user/me` - Get current user profile
- `GET /api/user/expenses` - List user expenses
- `POST /api/user/expenses` - Create expense
- `PUT /api/user/expenses/:id` - Update expense
- `DELETE /api/user/expenses/:id` - Delete expense
- `GET /api/user/categories` - List categories

### Dashboard Endpoints (Protected)
- `GET /api/dashboard/summary` - Get user dashboard summary
- `GET /api/dashboard/monthly` - Get monthly expense data

### Admin Endpoints (Admin Only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/expenses` - List all expenses
- `GET /api/admin/summary` - Get admin dashboard summary
- `GET /api/admin/categories` - Get category analytics

## 🎨 Design Decisions

### Color Scheme
- **Primary:** Teal (#14B8A6) - Modern, professional, finance-friendly
- **Success:** Green - Positive actions
- **Danger:** Red - Destructive actions
- **Neutral:** Gray - Text and backgrounds

### Typography
- Clean, readable fonts
- Consistent sizing hierarchy
- Proper spacing and line heights

### User Experience
- **Debounced Search:** 300ms delay to reduce unnecessary filtering
- **Smart Pagination:** Shows relevant page numbers with ellipsis
- **Loading States:** Skeleton loaders for better perceived performance
- **Empty States:** Helpful messages and call-to-actions
- **Error Handling:** Clear, actionable error messages

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Protected Routes** - Frontend and backend route protection
- **Role-Based Access** - Separate permissions for USER and ADMIN
- **SQL Injection Prevention** - Parameterized queries
- **CORS Configuration** - Controlled cross-origin requests

## 🚧 Future Improvements

### Features
- [ ] Budget planning and alerts
- [ ] Recurring expenses
- [ ] Export data to CSV/PDF
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Receipt upload and storage
- [ ] Expense categories customization
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Dark mode

### Technical
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Database migrations
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] WebSocket for real-time updates
- [ ] GraphQL API option

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first CSS framework
- Recharts for beautiful, customizable charts
- Express.js community for the robust backend framework

---

**Built with ❤️ using React, Node.js, and MySQL**
