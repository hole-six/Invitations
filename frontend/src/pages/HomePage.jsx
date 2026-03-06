import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import templateService from '../services/template.service'

const HomePage = () => {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await templateService.getAll({ is_active: 1, limit: 8 })
      const apiTemplates = (response.data || []).map(template => {
        try {
          const designData = typeof template.design_data === 'string'
            ? JSON.parse(template.design_data)
            : template.design_data

          return {
            id: template.id,
            name: template.name,
            slug: template.slug,
            category: template.category_name || 'Uncategorized',
            description: template.description,
            thumbnail: template.thumbnail_url,
            isPremium: Boolean(template.is_premium),
            isFeatured: Boolean(template.is_featured),
            usage_count: template.usage_count || 0,
            designData: designData
          }
        } catch (err) {
          console.error(`Failed to parse template ${template.id}:`, err)
          return null
        }
      }).filter(Boolean)

      setTemplates(apiTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 font-sans antialiased selection:bg-gray-900 selection:text-white">
      <Header />
      <div className="overflow-x-hidden">

        {/* Hero Section - Wedding Background */}
        <header
          className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gray-900"
        >
          {/* Wedding Background Image - Premium Luxury */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=2787&auto=format&fit=crop')",
            }}
          ></div>

          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>

          {/* Technical Grid Overlay - The "ERP" Feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-12 flex flex-col items-center justify-center h-full text-center">

            {/* System Badge - Tech Style */}


            {/* Main Headline - Authoritative */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl text-white leading-[1.1] tracking-tight mb-6 drop-shadow-2xl">

              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 font-sans font-bold">
                Thiệp Cưới Thông Minh
              </span>
            </h1>

            {/* Subheadline - Professional Description */}
            <p className="text-gray-400 text-base md:text-xl max-w-3xl mx-auto mb-10 font-light leading-relaxed tracking-wide">
              Giải pháp toàn diện dành cho các cặp đôi hiện đại. <br className="hidden md:block" />
              Tối ưu hóa quy trình từ thiết kế, gửi thiệp đến quản lý khách mời.
            </p>

            {/* Action Area - SaaS Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
              <button
                onClick={() => navigate('/collection')}
                className="group relative px-8 py-3.5 bg-white text-black text-sm font-bold tracking-wide uppercase overflow-hidden rounded-[4px] hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Bắt đầu ngay
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </button>

              <button
                onClick={() => navigate('/editor')}
                className="group px-8 py-3.5 bg-transparent border border-white/20 text-white text-sm font-bold tracking-wide uppercase hover:bg-white/5 hover:border-white/40 transition-all rounded-[4px] backdrop-blur-sm"
              >
                Xem Demo Hệ Thống
              </button>
            </div>

            {/* Data Dashboard Strip - The "ERP" Data Feel */}

          </div>

          {/* Scroll Indicator - Technical */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <span className="text-[9px] text-white font-mono uppercase tracking-[0.2em]">Scroll to Explore</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white to-transparent"></div>
          </div>
        </header>

        {/* Collection Preview - Super Premium & Responsive */}
        <section className="py-20 md:py-32 bg-gray-50 dark:bg-black relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]"></div>
            <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12">
            {/* Section Header - Centered & Elegant */}
            <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">

              <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tuyệt Tác <span className="italic font-light text-gray-400">Thiết Kế</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                Khám phá những mẫu thiệp cưới được yêu thích nhất. Đẳng cấp, tinh tế và hoàn toàn miễn phí.
              </p>
            </div>

            {/* Templates Grid - Responsive & Premium */}
            {/* Mobile: 2 columns (Instagram style), Tablet/Desktop: 4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {templates.slice(0, 4).map((template) => (
                <div
                  key={template.id}
                  className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out border border-gray-100 dark:border-zinc-800"
                  onClick={() => navigate('/collection')}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={template.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80'}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {template.isPremium && (
                        <span className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md text-black dark:text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                          Premium
                        </span>
                      )}
                    </div>

                    {/* Hover Action Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <button className="px-6 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                        Xem Chi Tiết
                      </button>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4 md:p-5 relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-serif text-base md:text-lg font-medium text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors truncate w-full">
                          {template.name}
                        </h3>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                          {template.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          Free
                        </span>
                      </div>
                    </div>

                    {/* Usage Stat */}
                    <div className="flex items-center gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800/50">
                      <div className="flex -space-x-1.5 md:-space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-200 dark:bg-gray-700"></div>
                        ))}
                      </div>
                      <span className="text-[9px] md:text-[10px] text-gray-500 font-medium">
                        +{template.usage_count || 120} đã dùng
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-12 md:mt-16 text-center">
              <button
                onClick={() => navigate('/collection')}
                className="group relative inline-flex items-center gap-3 px-8 py-3 md:py-4 bg-black dark:bg-white text-white dark:text-black font-bold text-xs md:text-sm tracking-widest uppercase rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Xem Tất Cả Mẫu
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section - Minimal */}
        <section className="py-12 md:py-24 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="font-serif text-3xl md:text-5xl font-medium text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Thiết Kế <span className="italic font-light text-gray-400">Chuyên Nghiệp</span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
                Mọi công cụ bạn cần để tạo nên một tấm thiệp cưới hoàn hảo. <br className="hidden md:block" /> Đơn giản, nhanh chóng và miễn phí.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center mb-24">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black">
                    <span className="material-symbols-outlined text-2xl">design_services</span>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Ultimate Editor</span>
                </div>

                <h3 className="font-serif text-3xl md:text-4xl text-gray-900 dark:text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Tùy Chỉnh <br /> <span className="italic font-light text-gray-500">Mọi Chi Tiết</span>
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 font-light leading-relaxed">
                  Công cụ chỉnh sửa kéo thả mạnh mẽ giúp bạn dễ dàng thay đổi nội dung, hình ảnh, phông chữ và màu sắc theo ý muốn.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    'Tải lên hình ảnh chất lượng cao',
                    'Kho nhạc nền đa dạng, cảm xúc',
                    'Hiệu ứng chuyển động mượt mà',
                    'Tối ưu hiển thị trên mọi thiết bị'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => navigate('/editor')} className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Trải Nghiệm Ngay
                </button>
              </div>

              <div className="relative order-1 lg:order-2 group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                <img
                  src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80"
                  alt="Wedding invitation editor"
                  className="relative w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>

            {/* Secondary Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: 'music_note', title: 'Nhạc Nền Cảm Xúc', desc: 'Thêm giai điệu yêu thích của hai bạn vào thiệp mời.' },
                { icon: 'share', title: 'Chia Sẻ Dễ Dàng', desc: 'Gửi thiệp qua Facebook, Zalo chỉ với một đường link.' },
                { icon: 'analytics', title: 'Thống Kê Khách Mời', desc: 'Theo dõi ai đã xem và xác nhận tham dự realtime.' }
              ].map((feature, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center md:text-left">
                  <span className="material-symbols-outlined text-4xl text-gray-900 dark:text-white mb-4">{feature.icon}</span>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 font-light">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="py-20 bg-black text-white text-center px-6">
          <h2 className="font-serif text-4xl md:text-6xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sẵn sàng tạo thiệp cưới?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 font-light">
            Bắt đầu ngay hôm nay. Hoàn toàn miễn phí và không cần kỹ năng thiết kế.
          </p>
          <button onClick={() => navigate('/collection')} className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-xl text-lg">
            Tạo Thiệp Ngay
          </button>
        </section>

        <Footer />
      </div>
    </div>
  )
}

export default HomePage