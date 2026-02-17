import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>

      {/* Centered Container with Split Panels */}
      <div
        className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row relative animate-scaleIn"
        style={{
          animation: 'scaleIn 0.4s ease-out'
        }}
      >
        {/* Left Panel - Branding & Visual */}
        <div className="lg:w-[45%] bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 dark:from-teal-600 dark:via-teal-700 dark:to-blue-700 p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden animate-slideInLeft">
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Illustration */}
            <div className="mb-10 hidden lg:block">
              <svg
                className="w-full h-48 opacity-90"
                viewBox="0 0 400 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Wallet */}
                <rect x="80" y="60" width="240" height="120" rx="12" fill="rgba(255,255,255,0.2)" />
                <rect x="80" y="60" width="240" height="35" rx="12" fill="rgba(255,255,255,0.3)" />
                <circle cx="280" cy="77" r="6" fill="rgba(255,255,255,0.8)" />

                {/* Coins */}
                <circle cx="100" cy="40" r="25" fill="rgba(252,211,77,0.9)" stroke="rgba(245,158,11,0.9)" strokeWidth="3" />
                <text x="100" y="48" textAnchor="middle" fill="rgba(146,64,14,0.9)" fontSize="20" fontWeight="bold">$</text>

                <circle cx="150" cy="25" r="20" fill="rgba(252,211,77,0.9)" stroke="rgba(245,158,11,0.9)" strokeWidth="3" />
                <text x="150" y="32" textAnchor="middle" fill="rgba(146,64,14,0.9)" fontSize="16" fontWeight="bold">$</text>

                {/* Chart bars */}
                <rect x="120" y="110" width="25" height="50" rx="4" fill="rgba(16,185,129,0.8)" />
                <rect x="155" y="95" width="25" height="65" rx="4" fill="rgba(52,211,153,0.8)" />
                <rect x="190" y="80" width="25" height="80" rx="4" fill="rgba(110,231,183,0.8)" />
                <rect x="225" y="100" width="25" height="60" rx="4" fill="rgba(16,185,129,0.8)" />
              </svg>
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Track your expenses smarter
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Simple, clear, and in your control. Take charge of your financial future today.
            </p>

            {/* Feature highlights */}
            <div className="mt-10 space-y-3 hidden lg:block">
              <div className="flex items-center text-white/80">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Real-time expense tracking</span>
              </div>
              <div className="flex items-center text-white/80">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Detailed analytics & insights</span>
              </div>
              <div className="flex items-center text-white/80">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Secure & private</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:w-[55%] p-8 lg:p-16 flex items-center justify-center bg-white dark:bg-slate-800 animate-slideInRight">
          <div className="w-full max-w-md">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
              <p className="text-gray-600 dark:text-gray-400">Sign in to continue to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
                <p className="text-red-700 dark:text-red-300 text-sm flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-200 outline-none hover:border-gray-300 dark:hover:border-slate-500 text-base"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-200 outline-none hover:border-gray-300 dark:hover:border-slate-500 text-base"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 dark:from-teal-500 dark:to-teal-600 dark:hover:from-teal-600 dark:hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 text-base"
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

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-teal-600 dark:text-teal-400 font-semibold hover:underline transition-all"
                >
                  Create account
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-500">
                Secure login powered by JWT authentication
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out 0.1s both;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out 0.2s both;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
