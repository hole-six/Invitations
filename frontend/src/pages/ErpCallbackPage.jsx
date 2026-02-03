import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import authService from '../services/auth.service'

const ErpCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const toast = useToast()
  const [status, setStatus] = useState('processing') // processing, success, error

  useEffect(() => {
    const handleErpLogin = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      const errorMessage = searchParams.get('message')

      // Handle error from backend
      if (error) {
        setStatus('error')
        toast.error(errorMessage || `Đăng nhập thất bại: ${error}`)
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      // Validate token
      if (!token) {
        setStatus('error')
        toast.error('Token không hợp lệ')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      try {
        // Save token
        localStorage.setItem('token', token)
        
        // Fetch user info
        const response = await authService.getCurrentUser()

        if (response.success && response.data) {
          // Login successful
          login(response.data, token)
          setStatus('success')
          toast.success('🎉 Đăng nhập thành công từ ERP!')
          
          // Redirect to dashboard
          setTimeout(() => navigate('/dashboard'), 1000)
        } else {
          throw new Error(response.message || 'Không thể lấy thông tin người dùng')
        }
      } catch (error) {
        console.error('ERP login error:', error)
        setStatus('error')
        toast.error('Đăng nhập thất bại: ' + (error.message || 'Lỗi không xác định'))
        localStorage.removeItem('token')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleErpLogin()
  }, [searchParams, navigate, login, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Logo or Icon */}
          <div className="mb-6">
            {status === 'processing' && (
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="space-y-3">
            {status === 'processing' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Đang xử lý...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Đang xác thực thông tin từ ERP
                </p>
              </>
            )}
            {status === 'success' && (
              <>
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Thành công!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Đang chuyển đến trang chủ...
                </p>
              </>
            )}
            {status === 'error' && (
              <>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Đăng nhập thất bại
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Đang chuyển về trang đăng nhập...
                </p>
              </>
            )}
          </div>

          {/* Progress Bar */}
          {status === 'processing' && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>Hệ thống tích hợp ERP</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErpCallbackPage
