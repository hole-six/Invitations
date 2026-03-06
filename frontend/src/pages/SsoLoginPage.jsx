import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api.service';

/**
 * SSO Callback Page
 * Xử lý callback từ ERP sau khi user login thành công
 * URL: /auth/sso/callback?token=xxx&state=xxx
 */
const SsoLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Đang xử lý đăng nhập SSO...');

  useEffect(() => {
    handleSsoCallback();
  }, []);

  const handleSsoCallback = async () => {
    try {
      // Lấy token và state từ URL params
      const token = searchParams.get('token');
      const state = searchParams.get('state');

      if (!token) {
        setStatus('error');
        setMessage('Không tìm thấy token xác thực. Vui lòng thử lại.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Gọi API callback để verify token và lấy user info
      const response = await apiService.get('/auth/sso/callback', {
        params: { token, state }
      });

      if (response.success) {
        const { token: weddingToken, user, return_url } = response.data;

        // Lưu token và user info vào context
        await login({
          token: weddingToken,
          user: user
        });

        setStatus('success');
        setMessage('Đăng nhập thành công! Đang chuyển hướng...');

        // Redirect về trang được yêu cầu hoặc dashboard
        setTimeout(() => {
          navigate(return_url || '/dashboard');
        }, 1500);
      } else {
        throw new Error(response.message || 'SSO authentication failed');
      }
    } catch (error) {
      console.error('SSO callback error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.message ||
        error.message ||
        'Đăng nhập SSO thất bại. Vui lòng thử lại.'
      );
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/logo.png"
              alt="Logo"
              className="mx-auto h-16 w-auto"
            />
          </div>

          {/* Status Icon */}
          <div className="mb-4">
            {status === 'processing' && (
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <svg
                className="mx-auto h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === 'error' && (
              <svg
                className="mx-auto h-12 w-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          {/* Message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'processing' && 'Đang xử lý...'}
            {status === 'success' && 'Thành công!'}
            {status === 'error' && 'Có lỗi xảy ra'}
          </h2>
          <p className="text-gray-600">{message}</p>

          {/* Manual redirect button for error case */}
          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Quay lại trang đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SsoLoginPage;
