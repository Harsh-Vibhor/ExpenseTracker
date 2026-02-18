import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminReportsRoutes from './routes/admin.reports.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import categoryRoutes from './routes/category.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();

// Allow requests from the deployed frontend (set FRONTEND_URL on Render).
// Falls back to wildcard in development so local dev still works.
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin/reports', adminReportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
