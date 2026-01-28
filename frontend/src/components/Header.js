import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/images/logo-small.png" 
              alt="Wedding Invite Logo" 
              className="h-16 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform shadow-sm"
            />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/collection" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Mẫu Thiệp</Link>
            <Link to="/editor" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Thiết Kế</Link>
            <Link to="/management" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Quản Lý</Link>
            <Link to="/pricing" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Bảng Giá</Link>
            <Link to="/contact" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Liên Hệ</Link>
          </div>
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.full_name}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Đăng Xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
                  Đăng Nhập
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary-dark text-white text-sm font-bold h-10 px-6 rounded-full transition-all shadow-lg shadow-primary/30 flex items-center">
                  Bắt Đầu Ngay
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
