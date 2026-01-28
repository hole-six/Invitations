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
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/images/logo-small.png" 
              alt="Wedding Invite Logo" 
              className="h-16 w-auto object-contain group-hover:scale-105 transition-transform shadow-sm"
            />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/collection" className="text-sm font-medium uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Mẫu Thiệp</Link>
            <Link to="/editor" className="text-sm font-medium uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Thiết Kế</Link>
            <Link to="/management" className="text-sm font-medium uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Quản Lý</Link>
            <Link to="/pricing" className="text-sm font-medium uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Bảng Giá</Link>
            <Link to="/contact" className="text-sm font-medium uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Liên Hệ</Link>
          </div>
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.full_name}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Đăng Xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Đăng Nhập
                </Link>
                <Link to="/register" className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black text-sm font-bold h-10 px-6 transition-all shadow-lg flex items-center">
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
