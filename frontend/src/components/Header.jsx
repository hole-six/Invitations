import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAdminAccess } from '../utils/permissions'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const isAdmin = hasAdminAccess()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <img style={{ width: '40px', height: '40px' }} src="/assets/images/logo-small.png" alt="" />
              <div className="flex flex-col text-gray-900 dark:text-white">
                <span className="font-serif text-xl font-bold leading-none tracking-wide">Hiweb</span>
                <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">.VN</span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Trang chủ</Link>
            <Link to="/collection" className="text-gray-700 hover:text-blue-600">Mẫu thiệp</Link>
            <Link to="/pricing" className="text-gray-700 hover:text-blue-600">Bảng giá</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">Liên hệ</Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/management" className="text-gray-700 hover:text-blue-600">
                  Quản lý
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
