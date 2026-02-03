import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const ContactPage = () => {
  const [selectedTopic, setSelectedTopic] = useState('design')

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white font-sans antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section - Wedding Background */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gray-900 border-b border-gray-800">
          {/* Wedding Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069')",
            }}
          ></div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>

          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
            {/* System Badge */}
       

            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Trung Tâm <br className="md:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 font-sans">
                Hỗ Trợ
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed tracking-wide">
              Đội ngũ kỹ thuật và tư vấn viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.
            </p>
          </div>
        </section>

        {/* Contact Info & Form Grid */}
        <section className="py-20 px-6 lg:px-12 max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Left Column: Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Thông tin liên hệ</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-full shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Văn phòng chính</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        123 Đường Hoa Lan, Quận 1<br />
                        TP. Hồ Chí Minh, Việt Nam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-full shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Email & Hỗ trợ</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">support@luxuryinvite.com</p>
                      <p className="text-gray-600 dark:text-gray-400">collaboration@luxuryinvite.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-full shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Hotline 24/7</h3>
                      <p className="text-gray-600 dark:text-gray-400">1900 1234 (8:00 - 22:00)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="w-full h-64 grayscale opacity-90 hover:grayscale-0 transition-all duration-500 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4245648509355!2d106.6905583!3d10.7787474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x1787491df0ed8d6a!2sIndependence%20Palace!5e0!3m2!1sen!2s!4v1651479836421!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-8 md:p-10 border border-gray-100 dark:border-gray-800">
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Gửi tin nhắn</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-light">
                Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 24h.
              </p>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Họ tên</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Số điện thoại</label>
                    <input
                      type="tel"
                      className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm"
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Chủ đề cần hỗ trợ</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Tư vấn thiết kế', 'Báo giá', 'Hợp tác', 'Khác'].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic)}
                        className={`text-sm py-3 px-4 text-left transition-all border ${selectedTopic === topic
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                          : 'bg-white dark:bg-black text-gray-500 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                          }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Nội dung</label>
                  <textarea
                    rows="4"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm resize-none"
                    placeholder="Nhập nội dung cần hỗ trợ..."
                  ></textarea>
                </div>

                <button
                  type="button"
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Minimal */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
              Câu hỏi thường gặp
            </h2>
            <div className="space-y-4">
              {[
                { q: "Thời gian thiết kế và in ấn mất bao lâu?", a: "Thông thường quy trình hoàn thiện mất từ 3-5 ngày làm việc kể từ khi chốt mẫu thiết kế." },
                { q: "Tôi có thể chỉnh sửa mẫu có sẵn không?", a: "Có, bạn hoàn toàn có thể tùy chỉnh màu sắc, nội dung và bố cục của bất kỳ mẫu nào." },
                { q: "Có hỗ trợ in số lượng ít không?", a: "Chúng tôi nhận in thiệp với số lượng tối thiểu từ 50 thiệp." }
              ].map((item, index) => (
                <details key={index} className="group bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 cursor-pointer">
                  <summary className="flex items-center justify-between font-bold text-lg list-none">
                    {item.q}
                    <span className="text-2xl font-light transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ContactPage
