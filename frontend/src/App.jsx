import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Categories from './pages/Categories.jsx';
import Reports from './pages/Reports.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminReports from './pages/AdminReports.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { useAuth } from './auth/AuthContext.jsx';

const App = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* User routes with DashboardLayout (USER only) */}
      <Route element={<ProtectedRoute requiredRole="USER" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/expenses" element={<Expenses />} />
          <Route path="/user/categories" element={<Categories />} />
          <Route path="/user/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* Admin routes with DashboardLayout (ADMIN only) */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Root path redirects based on auth/role */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? role === 'ADMIN'
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/user/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
