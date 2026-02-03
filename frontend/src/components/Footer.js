import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all">
                <img
                  src="/assets/images/logo-small.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold leading-none tracking-wide text-gray-900 dark:text-white">LUXURY</span>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 text-gray-600 dark:text-gray-400">Invite</span>
              </div>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light pr-6">
              Nền tảng thiết kế thiệp cưới cao cấp. Kết nối tình yêu qua những tấm thiệp tinh tế, sang trọng và độc bản.
            </p>
            <div className="flex gap-4 pt-2">
              {['facebook', 'instagram', 'twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600 transition-all bg-gray-50 dark:bg-gray-900"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {social === 'facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />}
                    {social === 'instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />}
                    {social === 'twitter' && <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2 md:col-span-1">
            <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-6">Sản Phẩm</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link className="hover:text-black dark:hover:text-white transition-colors" to="/collection">Thiệp cưới Online</Link></li>
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Thiệp Video</a></li>
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Thiệp giấy cao cấp</a></li>
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Website đám cưới</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2 md:col-span-1">
            <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-6">Hỗ Trợ</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Quy trình thiết kế</a></li>
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Câu hỏi thường gặp</a></li>
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Chính sách bảo mật</a></li>
              <li><Link className="hover:text-black dark:hover:text-white transition-colors" to="/contact">Liên hệ chúng tôi</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4">
            <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-6">Newsletter</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-light">
              Đăng ký để nhận những mẫu thiệp mới nhất và ưu đãi đặc biệt hàng tháng.
            </p>
            <div className="flex">
              <input
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-l-none px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors text-sm"
                placeholder="Email của bạn..."
                type="email"
              />
              <button className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 font-bold text-xs uppercase tracking-wider transition-colors">
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-light">© 2024 Luxury Invite. All rights reserved.</p>
          <div className="flex items-center gap-6 text-gray-400 text-xs font-medium">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Chính sách riêng tư</a>
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-6">
              <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">VN</span>
              <span className="text-gray-300">/</span>
              <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">EN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
