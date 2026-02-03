import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  // Ref for click outside to close dropdowns
  const dropdownRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }, [location.pathname])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  // Check if we're on dashboard pages
  const isDashboardPage = location.pathname.startsWith('/dashboard')

  // Navigation Items Definition
  const getNavigationItems = () => {
    if (isAdmin && isDashboardPage) {
      return [
        { to: '/dashboard', label: 'Tổng quan' },
        { to: '/dashboard/invitations', label: 'Thiệp mời' },
        { to: '/dashboard/templates', label: 'Kho giao diện' },
        { to: '/dashboard/users', label: 'Người dùng' },
        { to: '/dashboard/analytics', label: 'Thống kê' },
        { to: '/dashboard/settings', label: 'Cài đặt' }
      ]
    }

    const items = [
      { to: '/', label: 'Trang Chủ' },
      { to: '/collection', label: 'Bộ Sưu Tập' },
      { to: '/pricing', label: 'Bảng Giá' },
      { to: '/contact', label: 'Liên Hệ' }
    ]

    return items
  }

  const navigationItems = getNavigationItems()

  // Styles
  // Styles - ALWAYS SOLID/WHITE as requested
  const headerClass = `fixed top-0 z-50 w-full transition-all duration-300 bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 py-3`

  const linkClass = (path) => `relative text-sm font-medium transition-colors duration-300 hover:text-black dark:hover:text-white ${location.pathname === path
    ? 'text-black dark:text-white font-semibold'
    : 'text-gray-500 dark:text-gray-400'
    }`

  return (
    <nav className={headerClass}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">

          {/* LOGO AREA */}
          <Link to="/" className="flex items-center gap-3 group z-50 relative">
            <div className={`relative w-10 h-10 overflow-hidden rounded-full border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 scale-100`}>
              <img
                src="/assets/images/logo-small.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-gray-900 dark:text-white">
              <span className="font-serif text-xl font-bold leading-none tracking-wide">Hiweb</span>
              <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">.VN</span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-10">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={linkClass(item.to)}
              >
                {item.label}
                {location.pathname === item.to && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* DESKTOP ACTIONS / USER MENU */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-3 py-1.5 pl-1.5 pr-4 rounded-full transition-all duration-300 ${userDropdownOpen
                    ? 'bg-gray-100 dark:bg-gray-800 shadow-inner'
                    : 'hover:bg-gray-50 dark:hover:bg-white/10'
                    }`}
                >
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shadow-md">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs text-gray-400 font-medium mb-0.5">Tài khoản</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white max-w-[100px] truncate">
                      {user?.full_name?.split(' ').pop()}
                    </span>
                  </div>
                  <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown User Menu */}
                <div
                  className={`absolute right-0 mt-4 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 overflow-hidden origin-top-right transition-all duration-200 ${userDropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0 visible'
                    : 'opacity-0 scale-95 -translate-y-2 invisible'
                    }`}
                >
                  <div className="p-5 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Xin chào,</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate font-serif">{user?.full_name}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{user?.email}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      to="/management"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-lg">drafts</span>
                      </div>
                      Thiệp của tôi
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-lg">dashboard</span>
                        </div>
                        Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-lg">logout</span>
                      </div>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-sm font-bold uppercase tracking-wide hover:opacity-70 transition-opacity ${scrolled || isDashboardPage
                    ? 'text-black dark:text-white'
                    : 'text-gray-900 dark:text-white'
                    }`}
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Tạo Thiệp
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE - FIXED */}
          <div className="md:hidden flex items-center z-50">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -mr-2 rounded-full text-black dark:text-white"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN MENU - FIXED LAYOUT & Z-INDEX */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen bg-white dark:bg-black overflow-hidden flex flex-col md:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <img src="/assets/images/logo-small.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-bold leading-none text-gray-900 dark:text-white">LUXURY</span>
                <span className="text-[9px] uppercase tracking-widest text-gray-500">Menu</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 pb-32">

            {/* 1. User Card */}
            {isAuthenticated ? (
              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-3 flex items-center gap-3 mb-3 border border-gray-100 dark:border-gray-800 shadow-sm relative z-10">
                  <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {user?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/management" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-center text-xs">
                    Quản lý thiệp
                  </Link>
                  <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold text-center text-xs">
                    Thông báo
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl text-center border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">Chào mừng bạn!</h3>
                <p className="text-xs text-gray-500 mb-4">Đăng nhập để bắt đầu sáng tạo thiệp cưới.</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2.5 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-900 dark:text-white">
                    Đăng Nhập
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xs">
                    Đăng Ký
                  </Link>
                </div>
              </div>
            )}

            {/* 2. Navigation */}
            <div className="space-y-4 mb-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Khám phá</p>
              {navigationItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-xl font-serif font-bold pl-1 ${location.pathname === item.to
                    ? 'text-black dark:text-white'
                    : 'text-gray-400 dark:text-gray-600'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* 3. System Links */}
            {isAuthenticated && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Hệ thống</p>
                <div className="space-y-2">
                  {isAdmin && (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900">
                      <span className="material-symbols-outlined text-gray-500 text-lg">dashboard</span>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">Trang quản trị</span>
                    </Link>
                  )}
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900">
                    <span className="material-symbols-outlined text-gray-500 text-lg">person</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Tài khoản</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer for Logout */}
          {isAuthenticated && (
            <div className="absolute bottom-0 left-0 w-full p-5 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 z-50">
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Đăng xuất hệ thống
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Header
