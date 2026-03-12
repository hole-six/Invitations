import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import templateService from '../services/template.service'

const AdminTemplatePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('create') // create | list
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    category_id: 1,
    is_premium: false,
    html_content: '',
    tags: []
  })

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('⛔ Bạn không có quyền truy cập trang này!')
      navigate('/')
    }
  }, [user, navigate, toast])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('📤 Submitting template data:', formData)

      const response = await templateService.create(formData)

      console.log('✅ Template created:', response)
      toast.success('✨ Template đã được tạo thành công!')

      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        thumbnail_url: '',
        category_id: 1,
        is_premium: false,
        html_content: '',
        tags: []
      })
    } catch (error) {
      console.error('❌ Failed to create template:', error)
      toast.error(`❌ Không thể tạo template: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-3 sm:px-4 lg:px-6 xl:px-8 pt-20 sm:pt-24 pb-6 sm:pb-10 max-w-[1600px] mx-auto w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 shadow-2xl mb-6 sm:mb-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 mb-3 sm:mb-4">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold">Admin Panel</span>
            </div>
            <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Template Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Tạo và quản lý templates cho hệ thống
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 sm:px-6 py-3 font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${activeTab === 'create'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="whitespace-nowrap">Tạo Template</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 sm:px-6 py-3 font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${activeTab === 'list'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="whitespace-nowrap">Danh Sách</span>
          </button>
        </div>

        {/* Create Template Form */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Form Panel */}
            <div className="bg-gray-50 dark:bg-gray-900 shadow-xl p-4 sm:p-6 h-fit">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Thông Tin Template
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tên Template
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white dark:bg-black dark:text-white outline-none transition-all"
                    placeholder="VD: Luxury Gold Rose Wedding"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white dark:bg-black dark:text-white outline-none transition-all"
                    placeholder="luxury-gold-rose-wedding"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Mô Tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white dark:bg-black dark:text-white outline-none transition-all resize-none"
                    placeholder="Mô tả ngắn gọn về template..."
                  />
                </div>

                {/* Thumbnail URL */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white dark:bg-black dark:text-white outline-none transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.thumbnail_url && (
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      className="mt-3 w-full h-32 sm:h-40 object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                {/* Category & Premium */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white dark:bg-black dark:text-white outline-none transition-all"
                    >
                      <option value={1}>Wedding</option>
                      <option value={2}>Birthday</option>
                      <option value={3}>Anniversary</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all w-full">
                      <input
                        type="checkbox"
                        name="is_premium"
                        checked={formData.is_premium}
                        onChange={handleChange}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">Premium</span>
                    </label>
                  </div>
                </div>

                {/* HTML Content */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                    <span>HTML Content</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem('ultimate_preview_html', formData.html_content);
                          sessionStorage.setItem('ultimate_preview_template', JSON.stringify({
                            name: formData.name,
                            category_id: formData.category_id,
                            is_premium: formData.is_premium
                          }));
                          window.open('/ultimate-html-editor?previewMode=true', '_blank');
                        }}
                        className="text-[10px] px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
                      >
                        Ultimate Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="text-xs px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        {previewMode ? 'Edit' : 'Preview'}
                      </button>
                    </div>
                  </label>
                  <textarea
                    name="html_content"
                    value={formData.html_content}
                    onChange={handleChange}
                    rows={10}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white dark:bg-black dark:text-white outline-none transition-all resize-none font-mono"
                    placeholder="<!DOCTYPE html>..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-bold transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white dark:border-black border-t-transparent"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tạo Template</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preview Panel - Shown on desktop */}
            <div className="hidden lg:block bg-gray-50 dark:bg-gray-900 shadow-xl p-4 sm:p-6 sticky top-24 h-fit">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Live Preview
              </h2>

              <div className="border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-white">
                {formData.html_content ? (
                  <iframe
                    srcDoc={formData.html_content}
                    className="w-full h-[calc(100vh-300px)] min-h-[500px]"
                    title="Template Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p className="text-sm">Nhập HTML để xem preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Template List */}
        {activeTab === 'list' && (
          <div className="bg-gray-50 dark:bg-gray-900 shadow-xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Danh Sách Templates
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Coming soon...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminTemplatePage
