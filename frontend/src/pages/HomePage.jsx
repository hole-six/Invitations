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
    <div className="bg-white dark:bg-stone-950 font-sans antialiased overflow-x-hidden selection:bg-rose-400 selection:text-white">
      <Header />
      
      {/* Hero Section - Classic Elegant with Floral Animations */}
      <header 
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Classic elegant overlay - White and Gold theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-amber-50/70 to-amber-100/60"></div>
        
        {/* Animated floral decorations - Gold theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top left rose */}
          <div className="absolute -top-20 -left-20 w-64 h-64 opacity-15 animate-float-slow">
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-400">
              <path fill="currentColor" d="M100,20 Q120,40 120,60 Q120,80 100,100 Q80,80 80,60 Q80,40 100,20 M100,100 Q120,120 100,140 Q80,120 100,100 M100,100 Q80,120 60,120 Q40,120 20,100 Q40,80 60,80 Q80,80 100,100 M100,100 Q120,80 140,80 Q160,80 180,100 Q160,120 140,120 Q120,120 100,100"/>
            </svg>
          </div>
          
          {/* Top right leaves */}
          <div className="absolute -top-10 -right-10 w-48 h-48 opacity-10 animate-float-reverse">
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-500">
              <path fill="currentColor" d="M100,50 Q120,70 130,100 Q120,130 100,150 Q100,130 100,100 Q100,70 100,50 M100,100 Q80,70 70,50 Q80,30 100,20 Q100,40 100,70 Q100,85 100,100"/>
            </svg>
          </div>
          
          {/* Bottom left floral */}
          <div className="absolute -bottom-16 -left-16 w-56 h-56 opacity-15 animate-float-slow" style={{animationDelay: '1s'}}>
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-300">
              <circle cx="100" cy="100" r="15" fill="currentColor"/>
              <circle cx="100" cy="70" r="20" fill="currentColor" opacity="0.8"/>
              <circle cx="130" cy="100" r="20" fill="currentColor" opacity="0.8"/>
              <circle cx="100" cy="130" r="20" fill="currentColor" opacity="0.8"/>
              <circle cx="70" cy="100" r="20" fill="currentColor" opacity="0.8"/>
              <circle cx="120" cy="80" r="15" fill="currentColor" opacity="0.6"/>
              <circle cx="120" cy="120" r="15" fill="currentColor" opacity="0.6"/>
              <circle cx="80" cy="120" r="15" fill="currentColor" opacity="0.6"/>
              <circle cx="80" cy="80" r="15" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
          
          {/* Bottom right rose */}
          <div className="absolute -bottom-20 -right-20 w-72 h-72 opacity-10 animate-float-reverse" style={{animationDelay: '2s'}}>
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-600">
              <path fill="currentColor" d="M100,40 Q110,50 110,65 Q110,80 100,90 Q90,80 90,65 Q90,50 100,40 M100,90 Q110,100 100,115 Q90,100 100,90 M100,90 Q90,100 75,100 Q60,100 50,90 Q60,80 75,80 Q90,80 100,90 M100,90 Q110,80 125,80 Q140,80 150,90 Q140,100 125,100 Q110,100 100,90 M100,115 Q110,125 100,140 Q90,125 100,115"/>
            </svg>
          </div>
          
          {/* Floating petals - Gold theme */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-amber-300/20 animate-petal-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Elegant gold shimmer */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-400/30 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Classic elegant badge */}
           
            {/* Main headline - Classic elegant typography */}
            <h1 className="font-serif text-7xl md:text-7xl lg:text-7xl xl:text-8xl font-bold text-stone-800 leading-[1.05] tracking-tight mb-8" style={{fontFamily: "'Playfair Display', serif", textShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
              Câu Chuyện Tình Yêu
              <br/>
              <span className=" text-7xl text-amber-600 inline-block">
                Được Kể Bằng Trái Tim
              </span>
            </h1>

            {/* Subtitle - Classic elegant */}
            <p className="text-xl md:text-2xl text-stone-700 max-w-3xl mx-auto mb-12 leading-relaxed font-light" style={{fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.05em'}}>
              Mỗi tấm thiệp cưới là lời hứa về một tương lai bên nhau<br/>
              <span className="text-amber-600 font-medium">Nơi tình yêu được tôn vinh • Khoảnh khắc được lưu giữ • Hạnh phúc được chia sẻ</span>
            </p>

            {/* CTA Buttons - Classic elegant */}
            <div className="flex flex-wrap gap-5 justify-center mb-16">
              <button 
                onClick={() => navigate('/collection')}
                className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-white rounded-xl font-bold text-lg shadow-2xl shadow-amber-600/40 hover:shadow-amber-500/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-2 border-amber-300/50"
                style={{fontFamily: "'Cormorant Garamond', serif"}}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Khám Phá Bộ Sưu Tập
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button 
                onClick={() => navigate('/editor')}
                className="group px-10 py-5 bg-white/90 backdrop-blur-md border-2 border-amber-400/60 hover:bg-amber-50 hover:border-amber-500 text-stone-800 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                style={{fontFamily: "'Cormorant Garamond', serif"}}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xem Demo
              </button>
            </div>

            {/* Stats - Classic elegant */}
            <div className="flex flex-wrap gap-12 justify-center text-stone-700 text-sm" style={{fontFamily: "'Cormorant Garamond', serif"}}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium tracking-wide">10,000+ Cặp Đôi Tin Dùng</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium tracking-wide">500+ Mẫu Thiết Kế</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium tracking-wide">Miễn Phí Mãi Mãi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Features Section - Premium */}
      <section className="py-32 bg-gradient-to-b from-white to-amber-50 dark:from-stone-900 dark:to-stone-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-6">
              <span className="text-amber-700 dark:text-amber-400 text-sm font-semibold tracking-wider uppercase">Tính Năng Nổi Bật</span>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6" style={{fontFamily: "'Playfair Display', serif"}}>
              Tạo Thiệp Cưới<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600">
                Từ Tận Đáy Trái Tim
              </span>
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
              Mỗi chi tiết đều mang dấu ấn riêng của bạn, mỗi dòng chữ đều thấm đẫm tình yêu thương.<br/>
              Bởi vì ngày trọng đại của bạn xứng đáng được tôn vinh một cách hoàn hảo nhất.
            </p>
          </div>

          {/* CINEMATIC FEATURES LAYOUT */}
          <div className="space-y-12">
            {/* Hero Feature - Large with Image */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-amber-950/30 dark:via-amber-950/20 dark:to-amber-950/30 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-700 hover:shadow-2xl hover:shadow-amber-500/20">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Content */}
                <div className="relative p-12 lg:p-16 flex flex-col justify-center">
                  {/* Floating badge */}
                  <div className="absolute top-8 right-8 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-full shadow-lg animate-bounce" style={{animationDuration: '3s'}}>
                    500+ Mẫu
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white shadow-2xl shadow-amber-500/50">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    
                    <h3 className="font-serif text-4xl lg:text-5xl font-bold text-stone-900 dark:text-white mb-6 leading-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                      Thiết Kế Mang<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500">
                        Dấu Ấn Riêng
                      </span>
                    </h3>
                    
                    <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
                      Mỗi template được chúng tôi chăm chút tỉ mỉ từng chi tiết. Bạn có thể tùy chỉnh không giới hạn, 
                      thêm ảnh của riêng mình, viết câu chuyện tình yêu độc đáo. Bởi vì ngày trọng đại của bạn 
                      xứng đáng có một tấm thiệp thật đặc biệt.
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Tùy chỉnh không giới hạn
                      </span>
                      <span className="px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Thêm ảnh riêng
                      </span>
                      <span className="px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Viết câu chuyện
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Image */}
                <div className="relative h-[400px] lg:h-auto overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80"
                    alt="Wedding invitation design"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50/80 via-transparent to-transparent dark:from-rose-950/60"></div>
                </div>
              </div>
            </div>

            {/* Medium Features - 3 Columns */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 2 - Amber */}
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  ),
                  title: 'Nhạc Nền Của Riêng Bạn',
                  desc: 'Thêm bài hát đặc biệt của hai bạn. Mỗi khi mở thiệp, người nhận sẽ cảm nhận được tình yêu qua từng giai điệu.',
                  gradient: 'from-amber-400 to-orange-500',
                  bgGradient: 'from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30',
                  border: 'border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600',
                  shadow: 'shadow-amber-500/50'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  ),
                  title: 'Chia Sẻ Một Chạm',
                  desc: 'Gửi lời mời đến những người bạn yêu thương chỉ bằng một cú chạm. Mỗi lượt xem, mỗi lời chúc phúc đều là món quà vô giá.',
                  gradient: 'from-pink-400 to-rose-500',
                  bgGradient: 'from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-pink-950/30',
                  border: 'border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600',
                  shadow: 'shadow-pink-500/50'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: 'Theo Dõi Real-Time',
                  desc: 'Theo dõi từng phản hồi, từng lời chúc phúc từ khách mời. Những khoảnh khắc này sẽ trở thành kỷ niệm đẹp mãi.',
                  gradient: 'from-purple-400 to-indigo-500',
                  bgGradient: 'from-purple-50 via-indigo-50 to-purple-100 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-purple-950/30',
                  border: 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600',
                  shadow: 'shadow-purple-500/50'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${feature.bgGradient} border-2 ${feature.border} transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-${feature.shadow}`}
                >
                  <div className="relative p-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 text-white shadow-xl ${feature.shadow}`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4 leading-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                      {feature.title}
                    </h3>
                    
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                      {feature.desc}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 group-hover:gap-3 transition-all">
                      Tìm hiểu thêm
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Wide Feature - Full Width with Image */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/20">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image - Left Side */}
                <div className="relative h-[400px] lg:h-auto overflow-hidden order-2 lg:order-1">
                  <img 
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
                    alt="Security and privacy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-indigo-50/80 via-transparent to-transparent dark:from-indigo-950/60"></div>
                </div>
                
                {/* Content - Right Side */}
                <div className="relative p-12 lg:p-16 flex flex-col justify-center order-1 lg:order-2">
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 text-white shadow-2xl shadow-indigo-500/50">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    
                    <h3 className="font-serif text-4xl lg:text-5xl font-bold text-stone-900 dark:text-white mb-6 leading-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                      Bảo Mật &<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600">
                        Riêng Tư Tuyệt Đối
                      </span>
                    </h3>
                    
                    <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
                      Những khoảnh khắc riêng tư của bạn được bảo vệ tuyệt đối với công nghệ mã hóa hiện đại. 
                      Chỉ những người bạn mời mới có thể chia sẻ niềm hạnh phúc này cùng bạn. 
                      Dữ liệu của bạn luôn an toàn và được kiểm soát hoàn toàn bởi bạn.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-stone-700 dark:text-stone-300 font-medium">Mã hóa SSL 256-bit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Preview - With Real Templates */}
      <section className="py-32 bg-white dark:bg-stone-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-6">
                <span className="text-rose-600 dark:text-rose-400 text-sm font-semibold tracking-wider uppercase">Bộ Sưu Tập</span>
              </div>
              <h2 className="font-serif text-5xl md:text-6xl font-bold text-stone-900 dark:text-white mb-4 tracking-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                Mẫu Thiệp Mới Nhất
              </h2>
              <p className="text-stone-600 dark:text-stone-400 max-w-lg text-xl leading-relaxed">
                Những thiết kế được yêu thích nhất mùa cưới năm nay
              </p>
            </div>
            <button 
              onClick={() => navigate('/collection')}
              className="group px-8 py-4 border-2 border-stone-300 dark:border-stone-700 rounded-2xl hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-500 transition-all flex items-center gap-2 font-semibold text-lg"
            >
              Xem Tất Cả
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-3xl mb-6"></div>
                  <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded mb-2"></div>
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-2/3"></div>
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
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-stone-100 dark:bg-stone-800 mb-6 shadow-lg hover:shadow-2xl transition-all duration-500">
                    {/* Corner decorations */}
                    <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-tl-lg"></div>
                    <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-tr-lg"></div>
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg"></div>
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-br-lg"></div>
                    
                    <img 
                      src={template.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'}
                      alt={template.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Hover button */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 translate-y-12 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <button className="bg-white text-stone-900 px-6 py-3 rounded-xl font-bold text-sm shadow-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 hover:scale-105">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Chỉnh Sửa
                      </button>
                    </div>

                    {/* Premium badge */}
                    {template.isPremium && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          PREMIUM
                        </span>
                      </div>
                    )}

                    {/* Featured badge */}
                    {template.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          HOT
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white group-hover:text-rose-500 transition-colors mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                      {template.category}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {template.usage_count} lượt dùng
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video/Showcase Section */}
      <section className="relative py-32 bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-1000"></div>
              <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl border-2 border-white/10 bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80"
                  alt="Wedding showcase"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="group/play w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:scale-110 hover:bg-rose-500 hover:border-rose-500 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(244,63,94,0.6)]">
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                
                {/* Corner ornaments */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
              </div>
            </div>
            
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full mb-6">
                  <span className="text-rose-400 text-sm font-semibold tracking-wider uppercase">Trải Nghiệm Điện Ảnh</span>
                </div>
                <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                  Mỗi Tấm Thiệp<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400">
                    Là Một Lời Hứa Trọn Đời
                  </span>
                </h2>
                <p className="text-stone-400 text-lg leading-relaxed">
                  Chúng tôi hiểu rằng đây không chỉ là một tấm thiệp mời. 
                  Đây là lời mở đầu cho hành trình mới, là cách bạn chia sẻ niềm hạnh phúc 
                  với những người thân yêu nhất. Vì vậy, mỗi chi tiết đều được chúng tôi 
                  chăm chút với tất cả tâm huyết và tình yêu.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-10 border-t border-white/10 pt-10">
                <div className="group cursor-default">
                  <span className="block text-5xl font-serif font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">500+</span>
                  <span className="text-sm text-stone-500 uppercase tracking-wider">Mẫu Thiết Kế Độc Quyền</span>
                </div>
                <div className="group cursor-default">
                  <span className="block text-5xl font-serif font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">4K</span>
                  <span className="text-sm text-stone-500 uppercase tracking-wider">Chất Lượng Hiển Thị</span>
                </div>
                <div className="group cursor-default">
                  <span className="block text-5xl font-serif font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">24/7</span>
                  <span className="text-sm text-stone-500 uppercase tracking-wider">Hỗ Trợ Khách Hàng</span>
                </div>
                <div className="group cursor-default">
                  <span className="block text-5xl font-serif font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">100%</span>
                  <span className="text-sm text-stone-500 uppercase tracking-wider">Miễn Phí Sử Dụng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-white to-stone-50 dark:from-stone-950 dark:to-stone-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-6">
              <span className="text-rose-600 dark:text-rose-400 text-sm font-semibold tracking-wider uppercase">Câu Chuyện Khách Hàng</span>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6" style={{fontFamily: "'Playfair Display', serif"}}>
              Họ Đã Tìm Thấy Hạnh Phúc
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
              Những câu chuyện tình yêu đẹp từ các cặp đôi đã tin tưởng chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Minh & Hương',
                date: 'Cưới 15/08/2024',
                avatar: 'MH',
                text: 'Khi nhìn lại tấm thiệp cưới của mình, chúng tôi vẫn cảm thấy xúc động như ngày đầu. Mỗi chi tiết đều mang dấu ấn của tình yêu chúng tôi dành cho nhau. Cảm ơn đã giúp chúng tôi lưu giữ khoảnh khắc đẹp nhất cuộc đời.',
                rating: 5,
                color: 'from-rose-400 to-pink-500'
              },
              {
                name: 'Tuấn & Linh',
                date: 'Cưới 20/09/2024',
                avatar: 'TL',
                text: 'Thiệp cưới không chỉ là lời mời, mà là cách chúng tôi chia sẻ niềm hạnh phúc với mọi người. Khi bạn bè nhận được thiệp, họ đều nói rằng cảm nhận được tình yêu và sự chân thành từ chúng tôi. Đó là điều quý giá nhất.',
                rating: 5,
                color: 'from-amber-400 to-orange-500'
              },
              {
                name: 'Khoa & Trang',
                date: 'Cưới 10/10/2024',
                avatar: 'KT',
                text: 'Chúng tôi muốn một tấm thiệp thật đặc biệt, thể hiện được cá tính và câu chuyện tình yêu của mình. Và chúng tôi đã tìm thấy điều đó ở đây. Mỗi lần nhìn lại, chúng tôi lại thấy mình may mắn biết bao khi có nhau.',
                rating: 5,
                color: 'from-purple-400 to-indigo-500'
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-3xl bg-white dark:bg-stone-900 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-stone-200 dark:border-stone-800 hover:border-rose-400 dark:hover:border-rose-500"
              >
                <div className="absolute top-6 right-6 text-7xl text-rose-100 dark:text-rose-900/20 font-serif leading-none">"</div>
                
                <div className="relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8 text-lg italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-stone-200 dark:border-stone-800">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-serif text-lg font-bold text-stone-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-stone-500 dark:text-stone-400">{testimonial.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-white dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-6">
              <span className="text-rose-600 dark:text-rose-400 text-sm font-semibold tracking-wider uppercase">Quy Trình Đơn Giản</span>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6" style={{fontFamily: "'Playfair Display', serif"}}>
              Chỉ 3 Bước Đơn Giản
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
              Tạo thiệp cưới chuyên nghiệp trong vài phút
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Chọn Template',
                desc: 'Duyệt qua hàng trăm mẫu thiệp đẹp mắt, từ cổ điển đến hiện đại. Mỗi template đều được thiết kế bởi chuyên gia.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'Tùy Chỉnh',
                desc: 'Thay đổi màu sắc, font chữ, thêm ảnh và nội dung của bạn. Giao diện drag & drop siêu dễ sử dụng.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Chia Sẻ',
                desc: 'Xuất bản và chia sẻ thiệp qua link, QR code hoặc mạng xã hội. Theo dõi lượt xem và phản hồi real-time.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                {/* Connecting line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-rose-400 to-transparent"></div>
                )}
                
                <div className="relative p-8 rounded-3xl border-2 border-stone-200 dark:border-stone-800 hover:border-rose-400 dark:hover:border-rose-500 transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-stone-900 group">
                  <div className="absolute -top-6 left-8 px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-2xl rounded-xl shadow-lg">
                    {item.step}
                  </div>
                  
                  <div className="mt-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-rose-500">
                      {item.icon}
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">{item.title}</h3>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Final Push */}
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80')"}}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/90 via-pink-900/85 to-amber-900/90"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/30 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-400/20 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-full mb-10">
            <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white/95 text-sm font-medium tracking-widest uppercase">Bắt Đầu Ngay Hôm Nay</span>
          </div>
          
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8" style={{fontFamily: "'Playfair Display', serif"}}>
            Hãy Để Chúng Tôi<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-pink-200">
              Kể Câu Chuyện Của Bạn
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Mỗi tình yêu đều độc nhất vô nhị, mỗi câu chuyện đều xứng đáng được kể một cách đẹp đẽ nhất.<br/>
            <span className="text-amber-200">Hãy bắt đầu hành trình của bạn ngay hôm nay.</span>
          </p>
          
          <div className="flex flex-wrap gap-5 justify-center mb-12">
            <button 
              onClick={() => navigate('/collection')}
              className="group px-12 py-6 bg-white text-stone-900 hover:bg-stone-50 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all flex items-center gap-3"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Tạo Thiệp Miễn Phí
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-12 justify-center text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Không Cần Đăng Ký</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Miễn Phí Mãi Mãi</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Hỗ Trợ 24/7</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }
        
        @keyframes petal-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
        
        .animate-petal-fall {
          animation: petal-fall linear infinite;
        }
        
        .text-shimmer {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 25%, #fcd34d 50%, #fbbf24 75%, #f59e0b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default HomePage
