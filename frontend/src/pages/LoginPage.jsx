import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from 'react-turnstile';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  // const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaMeta, setCaptchaMeta] = useState(null);
  const [captchaError, setCaptchaError] = useState('');
  const TURNSTILE_SITE_KEY = "0x4AAAAAACLHdYHJg9SEsMFi"; // site key

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (captchaRequired && !captchaToken) {
      setCaptchaError('Vui lòng xác minh CAPTCHA để tiếp tục.');
      return;
    }
    setLoading(true);

    try {
      const response = await login({
        ...formData,
        captchaToken,
        captchaProvider: 'turnstile',
      });
      const user = response.data?.user;

      // Import permission helper
      const { hasAdminAccess } = await import('../utils/permissions');

      // Redirect based on permissions
      if (hasAdminAccess()) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
      setCaptchaRequired(false);
      setCaptchaToken('');
      setCaptchaMeta(null);
      setCaptchaError('');
    } catch (err) {
      console.error('Login failed:', err);
      const isCaptchaRequired =
        err?.code === 428 ||
        err?.status === 428 ||
        err?.raw?.code === 428 ||
        err?.raw?.msg === 'captcha.required' ||
        err?.message === 'captcha.required';
      if (isCaptchaRequired) {
        setCaptchaRequired(true);
        setCaptchaToken('');
        setCaptchaMeta(err?.data || err?.raw?.data || null);
        setCaptchaError('Vui lòng xác minh CAPTCHA để tiếp tục.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!captchaRequired) {
      setCaptchaToken('');
      setCaptchaMeta(null);
      setCaptchaError('');
    }
  }, [captchaRequired]);

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - IMAGE SHOWCASE */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80"
          alt="Wedding"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Monochrome Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-gray-100/80 to-gray-200/70"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-gray-900 p-12 text-center">
          <div className="max-w-md space-y-6">
            <div className="inline-block p-4 bg-gray-900 mb-4">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>

            <h1 className="text-5xl font-light mb-6 leading-tight text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create Beautiful<br />Wedding Invitations
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed">
              Thiết kế thiệp cưới đẹp trong vài phút.<br />
              Hàng trăm mẫu sang trọng, dễ dàng tùy chỉnh.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-8 text-center">
              <div>
                <div className="text-3xl font-light mb-1 text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Templates</div>
              </div>
              <div>
                <div className="text-3xl font-light mb-1 text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Happy Couples</div>
              </div>
              <div>
                <div className="text-3xl font-light mb-1 text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Free</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8 group">
            <img
              src="/assets/images/Logo9.jpg"
              alt="Wedding Invite Logo"
              className="h-17 w-auto object-contain rounded-lg hover:scale-105 transition-transform"
            />
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500">
              Đăng nhập để tiếp tục tạo thiệp cưới của bạn
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Username */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition"
                  placeholder="username or email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-gray-600 hover:text-gray-900 transition">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* CAPTCHA */}
            {captchaRequired && (
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  Vui lòng xác minh CAPTCHA để tiếp tục.
                  {captchaMeta?.retry_after_seconds
                    ? ` Thử lại sau ${captchaMeta.retry_after_seconds}s.`
                    : ''}
                </div>
                {TURNSTILE_SITE_KEY ? (
                  <Turnstile
                    sitekey={TURNSTILE_SITE_KEY}
                    fixedSize
                    refreshExpired="auto"
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setCaptchaError('');
                    }}
                    onExpire={() => {
                      setCaptchaToken('');
                    }}
                    onError={() => {
                      setCaptchaToken('');
                      setCaptchaError('CAPTCHA gặp lỗi, vui lòng thử lại.');
                    }}
                    className="min-h-[65px]"
                  />
                ) : (
                  <div className="text-sm text-red-600">
                    Thiếu cấu hình `VITE_TURNSTILE_SITE_KEY`.
                  </div>
                )}
                {captchaError && (
                  <p className="text-sm text-red-600">{captchaError}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>

              <button className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gray-600 hover:text-gray-900 transition">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
