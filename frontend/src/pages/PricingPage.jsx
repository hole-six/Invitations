import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const PricingPage = () => {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('yearly') // 'monthly' or 'yearly'

  return (
    <div className="bg-white dark:bg-stone-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <Header />
      
      {/* Hero Section - Cinematic */}
      <div className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden mt-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/80 via-rose-950/70 to-amber-950/80"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/30 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-400/20 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-full mb-8">
            <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white/95 text-sm font-medium tracking-widest uppercase">Gói Dịch Vụ Premium</span>
          </div>
          
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-8" style={{fontFamily: "'Playfair Display', serif", textShadow: '0 4px 30px rgba(0,0,0,0.5)'}}>
            Kiệt Tác Cho<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-pink-200 text-shimmer">
              Ngày Chung Đôi
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light mb-12" style={{fontFamily: "'Cormorant Garamond', serif"}}>
            Trải nghiệm thiết kế thiệp cưới đẳng cấp với sự hỗ trợ của AI và các chuyên gia hàng đầu.<br/>
            <span className="text-amber-200 font-medium">Chọn gói phù hợp với câu chuyện tình yêu của bạn.</span>
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-stone-900 shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/50'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Theo Năm
              {billingCycle === 'yearly' && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                  -40%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards - Cinematic Layout */}
      <div className="w-full py-32 bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Basic Plan - Elegant */}
            <div className="group relative flex flex-col bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl">
              {/* Header with gradient */}
              <div className="h-56 w-full bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 dark:from-stone-800 dark:via-stone-900 dark:to-stone-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '30px 30px'}}></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center justify-between">
                    <span className="px-4 py-2 bg-white/90 dark:bg-black/80 backdrop-blur rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg border border-stone-200 dark:border-stone-700">
                      Cơ Bản
                    </span>
                    <svg className="w-12 h-12 text-stone-400 dark:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-serif text-stone-900 dark:text-white mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Minimalist
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400">Sự khởi đầu tinh tế</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-stone-900 dark:text-white">Miễn phí</span>
                  </div>
                  <span className="text-sm text-stone-500 dark:text-stone-400">Trọn đời • Không giới hạn</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-stone-700 dark:text-stone-300">Thiết kế cơ bản tinh gọn</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-stone-700 dark:text-stone-300">Tối đa 50 khách mời</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-stone-700 dark:text-stone-300">Tùy chỉnh cơ bản</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-stone-700 dark:text-stone-300">Hỗ trợ cộng đồng</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/collection')}
                  className="w-full py-4 rounded-xl border-2 border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 font-bold text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group"
                >
                  Bắt Đầu Ngay
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Premium Plan - FEATURED */}
            <div className="group relative flex flex-col bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-amber-950/30 rounded-3xl border-2 border-rose-300 dark:border-rose-700 overflow-hidden shadow-2xl shadow-rose-500/20 scale-105 z-10 transition-all duration-700 hover:scale-110 hover:shadow-3xl hover:shadow-rose-500/30">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="px-6 py-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  ĐƯỢC CHỌN NHIỀU NHẤT
                </div>
              </div>
              
              {/* Header with AI Icon */}
              <div className="h-64 w-full relative overflow-hidden bg-gradient-to-br from-rose-400/20 via-pink-400/20 to-amber-400/20">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 shadow-2xl shadow-rose-500/50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                  <span className="mt-4 text-sm font-bold text-rose-600 dark:text-rose-400 tracking-[0.3em] uppercase">AI Powered</span>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col -mt-8 relative z-10">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-serif text-stone-900 dark:text-white mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Premium AI
                  </h3>
                  <p className="text-rose-600 dark:text-rose-400 font-semibold">Trí tuệ nhân tạo hỗ trợ</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600">
                      {billingCycle === 'yearly' ? '299k' : '49k'}
                    </span>
                  </div>
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    /{billingCycle === 'yearly' ? 'năm' : 'tháng'} • 
                    {billingCycle === 'yearly' && <span className="text-rose-600 dark:text-rose-400 font-bold ml-1">Tiết kiệm 40%</span>}
                  </span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">
                      <strong className="text-rose-600 dark:text-rose-400">AI Dự đoán</strong> phong cách thiệp hoàn hảo
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">Không giới hạn khách mời</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">Tùy chỉnh nâng cao</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">Nhạc nền & Video</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">Hỗ trợ ưu tiên 24/7</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/collection')}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-bold text-lg shadow-2xl shadow-rose-500/50 hover:shadow-rose-500/70 transition-all hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  Chọn Gói Premium
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Luxury Plan - VIP */}
            <div className="group relative flex flex-col bg-gradient-to-br from-stone-900 via-stone-950 to-black dark:from-black dark:via-stone-950 dark:to-stone-900 rounded-3xl border-2 border-amber-600/50 overflow-hidden shadow-2xl shadow-amber-900/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-3xl hover:shadow-amber-900/50">
              {/* Luxury Header */}
              <div className="h-56 w-full bg-gradient-to-br from-amber-900/30 via-stone-900 to-amber-900/30 relative overflow-hidden">
                <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, rgba(251,191,36,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-amber-400 font-serif italic text-2xl" style={{fontFamily: "'Playfair Display', serif"}}>
                      Signature
                    </span>
                  </div>
                  <div className="px-4 py-1.5 bg-amber-400/20 backdrop-blur border border-amber-400/50 rounded-full">
                    <span className="text-amber-300 text-xs font-bold tracking-wider uppercase">VIP</span>
                  </div>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-serif text-white mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Luxury VIP
                  </h3>
                  <p className="text-amber-400/80">Trải nghiệm độc quyền</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300">
                      1.200k
                    </span>
                  </div>
                  <span className="text-sm text-stone-400">Trọn đời • Không giới hạn</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-300">
                      <strong className="text-amber-400">Thiết kế cá nhân 1-1</strong> với Artist chuyên nghiệp
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-300">Tên miền riêng & Loại bỏ logo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-300">Tất cả tính năng Premium</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-300">Hỗ trợ VIP 24/7</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-stone-300">Tư vấn phong cách độc quyền</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/contact')}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-500 hover:via-amber-600 hover:to-amber-500 text-stone-900 font-bold text-lg shadow-2xl shadow-amber-900/50 hover:shadow-amber-900/70 transition-all hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  Liên Hệ Đặc Quyền
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .text-shimmer {
          background: linear-gradient(90deg, #fbbf24 0%, #fcd34d 25%, #fde68a 50%, #fcd34d 75%, #fbbf24 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default PricingPage
