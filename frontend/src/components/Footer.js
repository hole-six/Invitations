import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-stone-100 dark:bg-stone-900 pt-20 pb-10 border-t border-stone-200 dark:border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="size-8 text-primary">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-stone-900 dark:text-white">
                LUXURY<span className="text-primary font-normal text-2xl">.</span>INVITE
              </h2>
            </Link>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
              Nền tảng thiết kế thiệp cưới cao cấp hàng đầu Việt Nam. Chúng tôi tin rằng mỗi câu chuyện tình yêu đều xứng đáng được bắt đầu bằng một lời mời hoàn hảo.
            </p>
            <div className="flex gap-4 pt-2">
              <a className="size-10 rounded-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-500 hover:bg-primary hover:text-white hover:border-primary transition-all" href="#">
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a className="size-10 rounded-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-500 hover:bg-primary hover:text-white hover:border-primary transition-all" href="#">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
              </a>
              <a className="size-10 rounded-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-500 hover:bg-primary hover:text-white hover:border-primary transition-all" href="#">
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-2 md:col-span-1">
            <h4 className="font-serif font-bold text-stone-900 dark:text-white mb-6">Sản Phẩm</h4>
            <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <li><Link className="hover:text-primary transition-colors" to="/collection">Thiệp cưới Online</Link></li>
              <li><a className="hover:text-primary transition-colors" href="#">Thiệp Video</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Thiệp giấy cao cấp</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Website đám cưới</a></li>
            </ul>
          </div>
          <div className="lg:col-span-2 md:col-span-1">
            <h4 className="font-serif font-bold text-stone-900 dark:text-white mb-6">Trợ Giúp</h4>
            <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <li><a className="hover:text-primary transition-colors" href="#">Hướng dẫn sử dụng</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Câu hỏi thường gặp</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a></li>
              <li><Link className="hover:text-primary transition-colors" to="/contact">Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-4">
            <h4 className="font-serif font-bold text-stone-900 dark:text-white mb-6">Đăng ký nhận tin</h4>
            <p className="text-sm text-stone-500 mb-4">Nhận ngay ưu đãi 20% cho lần thiết kế đầu tiên.</p>
            <div className="flex">
              <input className="w-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-l-lg px-4 py-3 text-stone-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm" placeholder="Email của bạn..." type="email"/>
              <button className="bg-primary hover:bg-primary-dark text-white px-6 rounded-r-lg font-bold transition-colors">
                Gửi
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-500">© 2024 Luxury Invite. Designed with ❤️.</p>
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <span>Vietnamese</span>
            <span className="w-[1px] h-3 bg-stone-300"></span>
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
