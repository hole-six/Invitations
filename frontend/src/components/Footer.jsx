import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Footer = () => {
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  
  // Check if we're on dashboard pages
  const isDashboardPage = location.pathname.startsWith('/dashboard')

  // Don't show footer on dashboard pages
  if (isDashboardPage) {
    return null
  }

  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Mẫu thiệp cưới', href: '/collection' },
      { name: 'Thiết kế thiệp', href: '/editor' },
      { name: 'Quản lý thiệp', href: '/management' },
      { name: 'Bảng giá', href: '/pricing' }
    ],
    company: [
      { name: 'Về chúng tôi', href: '/about' },
      { name: 'Liên hệ', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'Tin tức', href: '/news' }
    ],
    support: [
      { name: 'Trung tâm hỗ trợ', href: '/help' },
      { name: 'Hướng dẫn sử dụng', href: '/guide' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Báo lỗi', href: '/report' }
    ],
    legal: [
      { name: 'Điều khoản sử dụng', href: '/terms' },
      { name: 'Chính sách bảo mật', href: '/privacy' },
      { name: 'Chính sách cookie', href: '/cookies