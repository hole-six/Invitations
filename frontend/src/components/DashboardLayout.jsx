import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNavigation from './BottomNavigation'

const DashboardLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Menu items configuration
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: (
        <span className="material-symbols-outlined">dashboard</span>
      ),
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      id: 'invitations',
      title: 'Quản lý thiệp mời',
      icon: (
        <span className="material-symbols-outlined">mail</span>
      ),
      path : '/dashboard/invitations',
      active: location.pathname === '/dashboard/invitations'
      // children: [
      //   { title: 'Tất cả thiệp mời', path: '/dashboard/invitations' },
      //   { title: 'Thiệp nháp', path: '/dashboard/invitations/drafts' },
      //   { title: 'Thiệp đã xuất bản', path: '/dashboard/invitations/published' },
      //   { title: 'Thiệp đã lưu trữ', path: '/dashboard/invitations/archived' }
      // ]
    },
    {
      id: 'templates',
      title: 'Quản lý Templates',
      icon: (
        <span className="material-symbols-outlined">web_asset</span>
      ),
      children: [
        { title: 'Tất cả Templates', path: '/dashboard/templates' },
        { title: 'Tạo Template mới', path: '/dashboard/templates/create' },
        { title: 'Categories', path: '/dashboard/templates/categories' }
      ]
    },
    // {
    //   id: 'users',
    //   title: 'Quản lý người dùng',
    //   icon: (
    //     <span className="material-symbols-outlined">group</span>
    //   ),
    //   children: [
    //     { title: 'Tất cả người dùng', path: '/dashboard/users' },
    //     { title: 'Người dùng hoạt động', path: '/dashboard/users/active' },
    //     { title: 'Quyền & Vai trò', path: '/dashboard/users/roles' }
    //   ]
    // },
    {
      id: 'analytics',
      title: 'Thống kê & Báo cáo',
      icon: (
        <span className="material-symbols-outlined">analytics</span>
      ),
      path: '/dashboard/analytics',
      active: location.pathname === '/dashboard/analytics'
      // children: [
      //   { title: 'Tổng quan', path: '/dashboard/analytics' },
      //   { title: 'Báo cáo sử dụng', path: '/dashboard/analytics/usage' },
      //   { title: 'Báo cáo doanh thu', path: '/dashboard/analytics/revenue' }
      // ]
    },
    {
      id: 'settings',
      title: 'Cài đặt hệ thống',
      icon: (
        <span className="material-symbols-outlined">settings</span>
      ),
      path : '/dashboard/settings',
      active: location.pathname === '/dashboard/settings'
      // children: [
      //   { title: 'Cài đặt chung', path: '/dashboard/settings' },
      //   { title: 'Email Templates', path: '/dashboard/settings/email' },
      //   { title: 'Backup & Restore', path: '/dashboard/settings/backup' }
      // ]
    }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const toggleDropdown = (itemId) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId)
  }

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.path)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <div
        className={`fixed md:sticky md:top-0 z-50 h-screen bg-white dark:bg-gray-800 shadow-xl border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300 transform 
        ${sidebarCollapsed ? 'md:w-20' : 'md:w-[280px]'}
        ${mobileDrawerOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header Logo Area */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <Link to="/dashboard" className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="relative w-8 h-8">
              <img src="/assets/images/logo-small.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Dashboard</span>
            )}
          </Link>

        {/* {!sidebarCollapsed && (
  <div className="w-full">
    <div className="bg-gray-900 dark:bg-white rounded-xl p-4 flex items-center gap-3 shadow-lg w-full">
      <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center text-white dark:text-black font-bold">
        {user?.full_name?.charAt(0)}
      </div>

      <div className="overflow-hidden flex-1">
        <p className="text-sm font-bold text-white dark:text-black truncate">
          {user?.full_name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Administrator
        </p>
      </div>
    </div>
  </div>
)} */}

          {/* Mobile Close Button */}
          <button
            className="md:hidden text-gray-500"
            onClick={() => setMobileDrawerOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <div key={item.id} className="mb-1">
              {/* Single Item vs Dropdown */}
              {item.children ? (
                <div className="group">
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isChildActive(item.children) || activeDropdown === item.id
                        ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-colors ${isChildActive(item.children) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {item.icon}
                      </div>
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    )}
                  </button>

                  {/* Dropdown Content */}
                  {!sidebarCollapsed && (activeDropdown === item.id || isChildActive(item.children)) && (
                    <div className="mt-1 ml-4 border-l border-gray-200 dark:border-gray-700 space-y-1 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-4 py-2 text-sm rounded-lg transition-colors ${location.pathname === child.path
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${item.active
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          {!sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
            </button>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-lg">
              <span className="material-symbols-outlined">logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-[72px] bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Drawer Toggle */}
            <button
              className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <span className="material-symbols-outlined font-bold text-2xl">menu</span>
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <span className="material-symbols-outlined">menu_open</span>
            </button>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              {location.pathname === '/dashboard' && 'Tổng quan'}
              {location.pathname.includes('/invitations') && 'Quản lý thiệp mời'}
              {location.pathname.includes('/templates') && 'Quản lý Templates'}
              {location.pathname.includes('/users') && 'Quản lý người dùng'}
              {location.pathname.includes('/analytics') && 'Thống kê & Báo cáo'}
              {location.pathname.includes('/settings') && 'Cài đặt hệ thống'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
              <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400 text-lg">search</span>
            </div>

            <button className="relative p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>

            {/* User Profile - Header (Mobile Only) */}
            <div className="md:hidden w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
              {user?.full_name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-3 overflow-y-auto mb-16 md:mb-0">
          {children}
        </main>
      </div>

      {/* Adding Bottom Navigation specific for DashboardMobile if needed, although Sidebar handles it well */}
      <BottomNavigation />
    </div>
  )
}

export default DashboardLayout