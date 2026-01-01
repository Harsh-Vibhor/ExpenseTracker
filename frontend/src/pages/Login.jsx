import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios.js';
import { useAuth } from '../auth/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const { token, user } = data;

      if (!token || !user) {
        setError('Invalid login response from server');
        setLoading(false);
        return;
      }

      login(token, user);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Illustration & Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-50 to-cyan-100 items-center justify-center p-12">
        <div className="max-w-md text-center">
          {/* Finance Illustration SVG */}
          <div className="mb-8">
            <svg
              className="w-full h-64 mx-auto"
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wallet */}
              <rect x="80" y="120" width="240" height="140" rx="12" fill="#0D9488" />
              <rect x="80" y="120" width="240" height="40" rx="12" fill="#14B8A6" />
              <circle cx="280" cy="140" r="8" fill="#F0FDFA" />

              {/* Coins */}
              <circle cx="100" cy="80" r="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="3" />
              <text x="100" y="90" textAnchor="middle" fill="#92400E" fontSize="24" fontWeight="bold">$</text>

              <circle cx="160" cy="60" r="25" fill="#FCD34D" stroke="#F59E0B" strokeWidth="3" />
              <text x="160" y="68" textAnchor="middle" fill="#92400E" fontSize="20" fontWeight="bold">$</text>

              {/* Chart bars */}
              <rect x="140" y="180" width="30" height="60" rx="4" fill="#10B981" />
              <rect x="180" y="160" width="30" height="80" rx="4" fill="#34D399" />
              <rect x="220" y="140" width="30" height="100" rx="4" fill="#6EE7B7" />
              <rect x="260" y="170" width="30" height="70" rx="4" fill="#10B981" />
            </svg>
          </div>

          {/* Text Content */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Track your expenses smarter
          </h1>
          <p className="text-lg text-gray-600">
            Simple, clear, and in your control
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header - Only visible on small screens */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Track your expenses smarter
            </h1>
            <p className="text-gray-600">
              Simple, clear, and in your control
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
            <p className="text-gray-600 mb-6">Sign in to your account</p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span className="text-teal-600 font-medium">Contact admin</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
