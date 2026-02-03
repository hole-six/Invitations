import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BottomNavigation = () => {
    const { pathname } = useLocation()
    const { user } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    // Hide for full-screen pages
    if (
        pathname.startsWith('/editor') ||
        pathname.startsWith('/ultimate-html-editor') ||
        pathname.includes('/invitation/')
    ) {
        return null
    }

    const isActive = (path) => {
        if (path === '/' && pathname === '/') return true
        if (path !== '/' && pathname.startsWith(path)) return true
        return false
    }

    const isDashboard = pathname.startsWith('/dashboard')

    // System-Tone Action Menu (Serious, Monochrome)
    const getActionItems = () => {
        if (isDashboard) {
            return [
                { label: 'Tạo Thiệp Mới', path: '/dashboard/invitations/create', icon: 'add_card', color: 'text-gray-800 dark:text-gray-200' },
                { label: 'Template Mới', path: '/dashboard/templates/create', icon: 'web_asset', color: 'text-gray-800 dark:text-gray-200' },
                { label: 'Thêm User', path: '/dashboard/users/create', icon: 'person_add', color: 'text-gray-800 dark:text-gray-200' },
                { label: 'Cấu Hình Email', path: '/dashboard/settings/email', icon: 'settings_ethernet', color: 'text-gray-800 dark:text-gray-200' },
            ]
        } else {
            return [
                { label: 'Tạo Thiệp Cưới', path: '/collection', icon: 'favorite', color: 'text-gray-800 dark:text-gray-200' },
                { label: 'Thiệp Sinh Nhật', path: '/collection?category=birthday', icon: 'cake', color: 'text-gray-800 dark:text-gray-200' },
                { label: 'Sự Kiện', path: '/collection?category=event', icon: 'event', color: 'text-gray-800 dark:text-gray-200' },
                { label: 'Album Ảnh', path: '/albums', icon: 'photo_library', color: 'text-gray-800 dark:text-gray-200' },
            ]
        }
    }

    const actionItems = getActionItems()

    let navItems = []
    if (isDashboard) {
        navItems = [
            { label: 'Tổng quan', path: '/dashboard', icon: 'dashboard', exact: true },
            { label: 'DS Thiệp', path: '/dashboard/invitations', icon: 'mail' },
            { isCenter: true }, // LOGO TRIGGER
            { label: 'Người dùng', path: '/dashboard/users', icon: 'group' },
            { label: 'Cài đặt', path: '/dashboard/settings', icon: 'settings' },
        ]
    } else {
        navItems = [
            { label: 'Trang chủ', path: '/', icon: 'home' },
            { label: 'Sản phẩm', path: '/collection', icon: 'grid_view' },
            { isCenter: true }, // LOGO TRIGGER
            { label: 'Của tôi', path: '/management', icon: 'inbox' },
            { label: 'Tài khoản', path: user ? '/account' : '/login', icon: 'person' },
        ]
    }

    return (
        <>
            {/* Dark Overlay for Menu */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Serious Grid Menu */}
            <div
                className={`md:hidden fixed bottom-20 left-4 right-4 z-[95] bg-white dark:bg-gray-900 rounded-xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.2)] p-6 transition-all duration-300 transform origin-bottom border border-gray-100 dark:border-gray-800 ${menuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8 pointer-events-none'
                    }`}
            >
                <div className="grid grid-cols-4 gap-4">
                    {actionItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="flex flex-col items-center gap-2 group"
                            onClick={() => setMenuOpen(false)}
                        >
                            <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                <span className={`material-symbols-outlined text-2xl ${item.color} group-hover:text-white dark:group-hover:text-black`}>
                                    {item.icon}
                                </span>
                            </div>
                            <span className="text-[10px] font-semibold text-center text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
                {/* Arrow Pointer */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 rotate-45 border-b border-r border-gray-100 dark:border-gray-800"></div>
            </div>

            {/* ERP-Like Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end h-[60px] relative px-0">

                    {navItems.map((item, index) => {
                        // LOGO BUTTON (CENTER)
                        if (item.isCenter) {
                            return (
                                <div key={index} className="flex justify-center items-center w-[20%] h-full relative z-10">
                                    <button
                                        onClick={() => setMenuOpen(!menuOpen)}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white dark:border-black shadow-lg transition-transform duration-200 active:scale-95 -mt-8 ${menuOpen ? 'bg-black dark:bg-white' : 'bg-white dark:bg-black'
                                            }`}
                                    >
                                        <div className="w-full h-full rounded-full overflow-hidden p-0.5">
                                            <img
                                                src="/assets/images/logo-small.png"
                                                alt="App"
                                                className={`w-full h-full object-cover rounded-full ${menuOpen ? 'opacity-80' : ''}`}
                                            />
                                        </div>
                                    </button>
                                </div>
                            )
                        }

                        // STANDARD NAV ITEMS
                        const active = item.exact ? pathname === item.path : isActive(item.path)
                        return (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 transition-colors ${active
                                        ? 'text-black dark:text-white'
                                        : 'text-gray-400 dark:text-gray-600'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[24px] ${active ? 'font-fill' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-70'}`}>
                                    {item.label}
                                </span>
                                {/* Active Indicator Dot */}
                                {active && (
                                    <span className="w-1 h-1 bg-black dark:bg-white rounded-full absolute bottom-1"></span>
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Safe Area Fill */}
                <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-black w-full"></div>
            </div>
        </>
    )
}

export default BottomNavigation
