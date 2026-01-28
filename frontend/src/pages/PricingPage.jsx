import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const PricingPage = () => {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('yearly') // 'monthly' or 'yearly'

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <Header />
      
      {/* Hero Section - Minimal */}
      <div className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden mt-20 bg-gray-50 dark:bg-gray-900">
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-widest uppercase">Gói Dịch Vụ Premium</span>
          </div>
          
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white leading-[1.05] mb-8" style={{fontFamily: "'Playfair Display', serif"}}>
            Kiệt Tác Cho<br/>
            <span className="text-gray-600 dark:text-gray-400">
              Ngày Chung Đôi
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-light mb-12" style={{fontFamily: "'Playfair Display', serif"}}>
            Trải nghiệm thiết kế thiệp cưới đẳng cấp với sự hỗ trợ của AI và các chuyên gia hàng đầu.<br/>
            <span className="text-gray-900 dark:text-white font-medium">Chọn gói phù hợp với câu chuyện tình yêu của bạn.</span>
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 font-semibold transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Theo Năm
              {billingCycle === 'yearly' && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold">
                  -40%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards - Minimal Layout */}
      <div className="w-full py-32 bg-white dark:bg-black relative">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Basic Plan - Minimal */}
            <div className="group relative flex flex-col bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl">
              {/* Header */}
              <div className="h-56 w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center justify-between">
                    <span className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wider shadow-lg">
                      Cơ Bản
                    </span>
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Minimalist
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Sự khởi đầu tinh tế</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">Miễn phí</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Trọn đời • Không giới hạn</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Thiết kế cơ bản tinh gọn</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Tối đa 50 khách mời</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Tùy chỉnh cơ bản</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Hỗ trợ cộng đồng</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/collection')}
                  className="w-full py-4 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
                >
                  Bắt Đầu Ngay
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Premium Plan - FEATURED */}
            <div className="group relative flex flex-col bg-gray-900 dark:bg-white text-white dark:text-black border-2 border-gray-900 dark:border-white overflow-hidden shadow-2xl scale-105 z-10 transition-all duration-700 hover:scale-110 hover:shadow-3xl">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="px-6 py-2 bg-white dark:bg-black text-black dark:text-white text-sm font-bold shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  ĐƯỢC CHỌN NHIỀU NHẤT
                </div>
              </div>
              
              {/* Header with AI Icon */}
              <div className="h-64 w-full relative overflow-hidden bg-gray-800 dark:bg-gray-100">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="relative w-20 h-20 bg-white dark:bg-black shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <svg className="w-10 h-10 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                  <span className="mt-4 text-sm font-bold text-gray-300 dark:text-gray-700 tracking-[0.3em] uppercase">AI Powered</span>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col -mt-8 relative z-10">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-serif mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Premium AI
                  </h3>
                  <p className="text-gray-300 dark:text-gray-700 font-semibold">Trí tuệ nhân tạo hỗ trợ</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black">
                      {billingCycle === 'yearly' ? '299k' : '49k'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 dark:text-gray-600">
                    /{billingCycle === 'yearly' ? 'năm' : 'tháng'} • 
                    {billingCycle === 'yearly' && <span className="font-bold ml-1">Tiết kiệm 40%</span>}
                  </span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">
                      <strong>AI Dự đoán</strong> phong cách thiệp hoàn hảo
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Không giới hạn khách mời</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Tùy chỉnh nâng cao</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Nhạc nền & Video</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Hỗ trợ ưu tiên 24/7</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/collection')}
                  className="w-full py-5 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  Chọn Gói Premium
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Luxury Plan - VIP */}
            <div className="group relative flex flex-col bg-black dark:bg-white text-white dark:text-black border-2 border-gray-600 dark:border-gray-400 overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-3xl">
              {/* Luxury Header */}
              <div className="h-56 w-full bg-gray-900 dark:bg-gray-100 relative overflow-hidden">
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-400 dark:text-gray-600 font-serif italic text-2xl" style={{fontFamily: "'Playfair Display', serif"}}>
                      Signature
                    </span>
                  </div>
                  <div className="px-4 py-1.5 bg-gray-700 dark:bg-gray-300 border border-gray-600 dark:border-gray-400">
                    <span className="text-gray-300 dark:text-gray-700 text-xs font-bold tracking-wider uppercase">VIP</span>
                  </div>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-serif mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Luxury VIP
                  </h3>
                  <p className="text-gray-400 dark:text-gray-600">Trải nghiệm độc quyền</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      1.200k
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 dark:text-gray-600">Trọn đời • Không giới hạn</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 dark:text-gray-700">
                      <strong>Thiết kế cá nhân 1-1</strong> với Artist chuyên nghiệp
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 dark:text-gray-700">Tên miền riêng & Loại bỏ logo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 dark:text-gray-700">Tất cả tính năng Premium</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 dark:text-gray-700">Hỗ trợ VIP 24/7</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white dark:bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 dark:text-gray-700">Tư vấn phong cách độc quyền</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/contact')}
                  className="w-full py-5 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center justify-center gap-2 group"
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
    </div>
  )
}

export default PricingPage
