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
    <div className="bg-white dark:bg-gray-900 font-sans antialiased overflow-x-hidden selection:bg-gray-900 selection:text-white">
      <Header />
      
      {/* Hero Section - Minimal Monochrome */}
      <header 
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Monochrome overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-gray-100/85"></div>
        
        {/* Minimal geometric elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 border border-gray-200 rounded-full opacity-30"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 border border-gray-300 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-gray-400 rounded-full opacity-40"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gray-400 rounded-full opacity-40"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Minimal badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full mb-12">
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
              <span className="text-gray-900 text-sm font-medium tracking-wide">WEDDING INVITATIONS</span>
            </div>
           
            {/* Clean typography */}
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light text-gray-900 leading-[1.1] tracking-tight mb-8" style={{fontFamily: "'Playfair Display', serif"}}>
              Thiệp Cưới
              <br/>
              <span className="font-normal">Tinh Tế</span>
            </h1>

            {/* Simple subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-16 leading-relaxed font-light">
              Thiết kế tối giản, sang trọng<br/>
              <span className="text-gray-900 font-medium">Mỗi chi tiết đều hoàn hảo</span>
            </p>

            {/* Minimal CTA */}
            <div className="flex flex-wrap gap-4 justify-center mb-20">
              <button 
                onClick={() => navigate('/collection')}
                className="px-12 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
              >
                Khám Phá
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button 
                onClick={() => navigate('/editor')}
                className="px-12 py-4 bg-white border border-gray-300 hover:border-gray-900 text-gray-900 font-medium text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Xem Demo
              </button>
            </div>

            {/* Clean stats */}
            <div className="flex flex-wrap gap-16 justify-center text-gray-600 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="font-medium">10,000+ Cặp Đôi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="font-medium">500+ Mẫu Thiết Kế</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="font-medium">Miễn Phí</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </header>

      {/* Features Section - Minimal */}
      <section className="py-32 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-8">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-wider uppercase">Tính Năng</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6" style={{fontFamily: "'Playfair Display', serif"}}>
              Thiết Kế
              <br/>
              <span className="font-normal">Chuyên Nghiệp</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Mỗi chi tiết được chăm chút tỉ mỉ.<br/>
              Đơn giản nhưng không đơn điệu.
            </p>
          </div>

          {/* MINIMAL FEATURES LAYOUT */}
          <div className="space-y-16">
            {/* Main Feature - Clean Grid */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-12 h-12 bg-gray-900 flex items-center justify-center mb-8">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                
                <h3 className="font-serif text-3xl font-light text-gray-900 dark:text-white mb-6" style={{fontFamily: "'Playfair Display', serif"}}>
                  Thiết Kế<br/>
                  <span className="font-normal">Tùy Chỉnh</span>
                </h3>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Mỗi template được thiết kế tối giản nhưng tinh tế. 
                  Bạn có thể tùy chỉnh mọi chi tiết theo phong cách riêng.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Tùy chỉnh không giới hạn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Upload ảnh riêng</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Chỉnh sửa nội dung</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80"
                  alt="Wedding invitation design"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>

            {/* Secondary Features - Clean Grid */}
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  ),
                  title: 'Nhạc Nền',
                  desc: 'Thêm bài hát yêu thích của hai bạn vào thiệp cưới.'
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  ),
                  title: 'Chia Sẻ',
                  desc: 'Gửi lời mời đến những người thân yêu chỉ bằng một link.'
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: 'Thống Kê',
                  desc: 'Theo dõi lượt xem và phản hồi từ khách mời.'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                    {feature.icon}
                  </div>
                  
                  <h3 className="font-serif text-xl font-light text-gray-900 dark:text-white mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Collection Preview - Minimal */}
      <section className="py-32 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-wider uppercase">Bộ Sưu Tập</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
                Mẫu Thiệp Mới Nhất
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg text-lg leading-relaxed">
                Những thiết kế được yêu thích nhất
              </p>
            </div>
            <button 
              onClick={() => navigate('/collection')}
              className="group px-8 py-4 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300 transition-all flex items-center gap-2 font-medium"
            >
              Xem Tất Cả
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 mb-6"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {templates.slice(0, 8).map((template, index) => (
                <div 
                  key={template.id} 
                  className="group cursor-pointer"
                  onClick={() => navigate('/collection')}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700 mb-6 hover:shadow-lg transition-all duration-300">
                    <img 
                      src={template.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <button className="bg-white text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-900 hover:text-white transition-all">
                        Chỉnh Sửa
                      </button>
                    </div>

                    {template.isPremium && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-gray-900 text-white text-xs font-medium">
                          PREMIUM
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-light text-gray-900 dark:text-white mb-1 group-hover:text-gray-600 transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.usage_count || 0} lượt dùng</span>
                    <span className={template.isPremium ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                      {template.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage