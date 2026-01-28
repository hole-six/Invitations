import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const ContactPage = () => {
  const [selectedTopic, setSelectedTopic] = useState('design')

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-display overflow-x-hidden antialiased flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow mt-20">
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Hỗ trợ trực tuyến 24/7
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Chúng tôi có thể giúp gì <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">cho ngày vui của bạn?</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Kết nối ngay với đội ngũ chuyên gia hoặc sử dụng trợ lý ảo AI để giải đáp mọi thắc mắc về thiệp cưới và thiết kế.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* AI Assistant */}
            <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-surface-dark p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 w-fit">
                  <span className="material-symbols-outlined text-3xl">smart_toy</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Trợ lý ảo AI</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                  Nhận câu trả lời ngay lập tức về bảng giá, quy trình in ấn và mẫu thiết kế mới nhất.
                </p>
                <button className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 hover:gap-3 transition-all group-hover:underline decoration-2 underline-offset-4">
                  Chat ngay với AI <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Video Consultation */}
            <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-surface-dark p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-primary w-fit">
                  <span className="material-symbols-outlined text-3xl">video_camera_front</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Tư vấn Video 1:1</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                  Đặt lịch hẹn tư vấn video trực tiếp 30 phút với chuyên gia thiết kế hàng đầu.
                </p>
                <button className="flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all group-hover:underline decoration-2 underline-offset-4">
                  Đặt lịch hẹn tư vấn <span className="material-symbols-outlined text-lg">calendar_add_on</span>
                </button>
              </div>
            </div>

            {/* Hotline */}
            <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-surface-dark p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-fit">
                  <span className="material-symbols-outlined text-3xl">headset_mic</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Tổng đài hỗ trợ</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                  Liên hệ trực tiếp qua Hotline 1900 1234 hoặc Email nếu bạn cần hỗ trợ kỹ thuật.
                </p>
                <a href="tel:19001234" className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 hover:gap-3 transition-all group-hover:underline decoration-2 underline-offset-4">
                  Gọi ngay 1900 1234 <span className="material-symbols-outlined text-lg">call</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & FAQ */}
        <section className="py-16 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
              {/* Contact Form */}
              <div className="lg:col-span-7">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-3">Gửi yêu cầu hỗ trợ</h2>
                  <p className="text-gray-500 dark:text-gray-400">Điền thông tin vào biểu mẫu thông minh bên dưới, hệ thống sẽ tự động phân loại và chuyển đến bộ phận phù hợp.</p>
                </div>
                <form className="space-y-8">
                  {/* Topic Selection */}
                  <div>
                    <label className="block text-sm font-bold mb-4 text-gray-900 dark:text-white">Bạn cần hỗ trợ về vấn đề gì?</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'design', icon: 'palette', label: 'Tư vấn thiết kế' },
                        { id: 'order', icon: 'shopping_cart', label: 'Đơn hàng' },
                        { id: 'payment', icon: 'payments', label: 'Thanh toán' },
                        { id: 'shipping', icon: 'local_shipping', label: 'Vận chuyển' },
                        { id: 'partner', icon: 'handshake', label: 'Hợp tác' },
                        { id: 'other', icon: 'more_horiz', label: 'Khác' }
                      ].map((topic) => (
                        <label key={topic.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="topic"
                            value={topic.id}
                            checked={selectedTopic === topic.id}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            className="peer sr-only"
                          />
                          <div className="h-full flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 transition-all text-center peer-checked:border-primary peer-checked:bg-pink-50 dark:peer-checked:bg-primary/10 peer-checked:text-primary">
                            <span className="material-symbols-outlined mb-2 text-2xl">{topic.icon}</span>
                            <span className="text-sm font-semibold">{topic.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        className="peer block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-transparent px-4 pb-2.5 pt-5 text-sm focus:border-primary focus:ring-0 dark:text-white"
                        placeholder=" "
                      />
                      <label
                        htmlFor="name"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-primary dark:text-gray-400"
                      >
                        Họ và tên
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        className="peer block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-transparent px-4 pb-2.5 pt-5 text-sm focus:border-primary focus:ring-0 dark:text-white"
                        placeholder=" "
                      />
                      <label
                        htmlFor="phone"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-primary dark:text-gray-400"
                      >
                        Số điện thoại
                      </label>
                    </div>
                    <div className="relative sm:col-span-2">
                      <input
                        type="email"
                        id="email"
                        className="peer block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-transparent px-4 pb-2.5 pt-5 text-sm focus:border-primary focus:ring-0 dark:text-white"
                        placeholder=" "
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-primary dark:text-gray-400"
                      >
                        Địa chỉ Email
                      </label>
                    </div>
                    <div className="relative sm:col-span-2">
                      <textarea
                        id="message"
                        rows="4"
                        className="peer block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-transparent px-4 pb-2.5 pt-5 text-sm focus:border-primary focus:ring-0 dark:text-white resize-none"
                        placeholder=" "
                      ></textarea>
                      <label
                        htmlFor="message"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-primary dark:text-gray-400"
                      >
                        Nội dung chi tiết
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full sm:w-auto h-14 px-8 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary-dark hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Gửi tin nhắn</span>
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </div>

              {/* FAQ Sidebar */}
              <div className="lg:col-span-5 flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>
                
                {/* Search */}
                <div className="relative mb-8 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-primary rounded-xl ring-0 focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 dark:text-white"
                    placeholder="Tìm kiếm câu hỏi (VD: In ấn, Giao hàng...)"
                  />
                </div>

                {/* FAQ Items */}
                <div className="space-y-4 flex-grow">
                  <details className="group bg-transparent border-b border-gray-200 dark:border-gray-700 pb-4" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-2 font-bold hover:text-primary transition-colors list-none">
                      <span className="text-base">Thời gian in ấn mất bao lâu?</span>
                      <span className="material-symbols-outlined text-gray-500 transition-transform group-open:-rotate-180">expand_more</span>
                    </summary>
                    <div className="pt-2 leading-relaxed text-sm text-gray-500 dark:text-gray-400">
                      Thông thường, thời gian in ấn và gia công hoàn thiện mất từ 3-5 ngày làm việc sau khi bạn chốt mẫu thiết kế cuối cùng.
                    </div>
                  </details>

                  <details className="group bg-transparent border-b border-gray-200 dark:border-gray-700 pb-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-2 font-bold hover:text-primary transition-colors list-none">
                      <span className="text-base">Tôi có thể chỉnh sửa mẫu có sẵn không?</span>
                      <span className="material-symbols-outlined text-gray-500 transition-transform group-open:-rotate-180">expand_more</span>
                    </summary>
                    <div className="pt-2 leading-relaxed text-sm text-gray-500 dark:text-gray-400">
                      Hoàn toàn được! Bạn có thể thay đổi màu sắc, font chữ, bố cục và nội dung của bất kỳ mẫu nào trong bộ sưu tập.
                    </div>
                  </details>

                  <details className="group bg-transparent border-b border-gray-200 dark:border-gray-700 pb-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-2 font-bold hover:text-primary transition-colors list-none">
                      <span className="text-base">Chính sách hoàn tiền như thế nào?</span>
                      <span className="material-symbols-outlined text-gray-500 transition-transform group-open:-rotate-180">expand_more</span>
                    </summary>
                    <div className="pt-2 leading-relaxed text-sm text-gray-500 dark:text-gray-400">
                      Chúng tôi hoàn tiền 100% nếu sản phẩm in ấn bị lỗi kỹ thuật hoặc sai lệch quá 10% so với mẫu thiết kế đã duyệt.
                    </div>
                  </details>

                  <details className="group bg-transparent border-b border-gray-200 dark:border-gray-700 pb-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-2 font-bold hover:text-primary transition-colors list-none">
                      <span className="text-base">Có hỗ trợ thiết kế riêng không?</span>
                      <span className="material-symbols-outlined text-gray-500 transition-transform group-open:-rotate-180">expand_more</span>
                    </summary>
                    <div className="pt-2 leading-relaxed text-sm text-gray-500 dark:text-gray-400">
                      Có, gói thiết kế độc quyền "Bespoke" của chúng tôi cho phép bạn làm việc 1:1 với Art Director để tạo ra mẫu thiệp độc nhất.
                    </div>
                  </details>
                </div>

                {/* Map */}
                <div className="mt-8 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      <span className="font-bold text-sm">123 Đường Hoa Lan, Q.1, TP.HCM</span>
                    </div>
                    <a href="#" className="text-xs font-bold text-primary hover:underline">Chỉ đường</a>
                  </div>
                  <div className="w-full h-40 rounded-2xl overflow-hidden relative shadow-md">
                    <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrAdofY-4C_-_WHn9Ankq-_TaYYSg70xk-l5y86P7YtPdqc1_tZOB0u-aZXhlyozb_4GGAqdrUCA8pc9bcTIsFjPuCNOutCVWVKOmSxQ779yUSeFS7iiyRQTSrKoOls0bzSplzrhLz46Ca9_ResOu0zHCDYUcUQ1HwaTaSXfNY_sMiWrteaPl6AvCFbJTBZAk13EF84ukh3TXBhceZWtLjAk7u6XJeEV8HXWBNQw_WFHqzSeghvmdtw_ipfr39oTLr9vAevXq8AsCf')"}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Parallax Image Section */}
        <section className="w-full h-64 md:h-80 relative overflow-hidden">
          <div className="w-full h-full bg-cover bg-fixed bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaV36eGMNxx505iBGcCr_QayvCz23X7OhopYvjouzudimdv97I5Lrcl3N-YWeNCS6pLaz5yVW_6Cx7mjzz3gozf_gyi2CCJ1TKXkS_6_y9hSMv6Or5PYTzQYHD5CqW1mvRvUEkO0qA-vR2CU4nMK7ewCLT6F8wLKEswv0koZBvYNRqFf0lnGenL-Di_vA6d4lGuAoqh1-iKtxUX65sURI1oBbMNIREVe67zA_qNUD6Kjff2N_WRwhxouTxe31fQCIq75S99XTkEX-L')"}}></div>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center px-4">Đồng hành cùng hạnh phúc của bạn</h2>
          </div>
        </section>
      </main>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <div className="absolute bottom-full right-0 mb-3 w-48 bg-white dark:bg-surface-dark p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-300 origin-bottom-right scale-95 group-hover:scale-100">
          <p className="text-xs font-medium text-gray-900 dark:text-white">Cần hỗ trợ gấp?<br/><span className="text-primary">Chat với AI ngay!</span></p>
        </div>
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-pink-500 text-white shadow-xl shadow-primary/30 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
        </button>
      </div>

      <Footer />
    </div>
  )
}

export default ContactPage
