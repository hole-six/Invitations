import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAdminAccess } from '../utils/permissions'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const isAdmin = hasAdminAccess()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 hover:border-blue-200 hover:bg-blue-50 transition"
                    title="Profile"
                    aria-label="Profile"
                    aria-expanded={profileOpen}
                  >
                    <img
                      src={user?.avatar_url || '/assets/images/avatar-default.png'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/avatar-default.png'
                      }}
                    />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        Hồ sơ
                      </Link>
                      <Link
                        to="/management"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">inbox</span>
                        Quản lý
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span className="material-symbols-outlined text-[18px]">dashboard</span>
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
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
