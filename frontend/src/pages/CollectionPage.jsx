import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import templateService from '../services/template.service'
import invitationService from '../services/invitation.service'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import allTemplates from '../data/premiumTemplates'

const CollectionPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingInvitation, setCreatingInvitation] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortBy, setSortBy] = useState('popular') // popular, newest, name
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load from API
      try {
        const [templatesRes, categoriesRes] = await Promise.all([
          templateService.getAll({ is_active: 1 }),
          templateService.getCategories()
        ])
        
        console.log('📦 Templates from API:', templatesRes.data?.length || 0)
        
        // Parse API templates (design_data is JSON string from database)
        const apiTemplates = (templatesRes.data || []).map(template => {
          try {
            // Parse design_data if it's a string
            const designData = typeof template.design_data === 'string' 
              ? JSON.parse(template.design_data)
              : template.design_data
            
            // Parse tags if it's a string
            const tags = typeof template.tags === 'string'
              ? JSON.parse(template.tags)
              : template.tags
            
            return {
              id: template.id,
              name: template.name,
              slug: template.slug,
              category: template.category_name || 'Uncategorized',
              category_id: template.category_id,
              description: template.description,
              thumbnail: template.thumbnail_url,
              isPremium: Boolean(template.is_premium),
              isFeatured: Boolean(template.is_featured),
              is_premium: Boolean(template.is_premium),
              is_featured: Boolean(template.is_featured),
              usage_count: template.usage_count || 0,
              designData: designData,
              tags: tags
            }
          } catch (err) {
            console.error(`Failed to parse template ${template.id}:`, err)
            return null
          }
        }).filter(Boolean) // Remove null entries
        
        console.log('✅ Parsed templates:', apiTemplates.length)
        
        // Use ONLY API templates (no local templates)
        setTemplates(apiTemplates)
        setCategories(categoriesRes.data || [])
      } catch (apiError) {
        console.error('❌ API Error:', apiError)
        toast.error('Không thể tải danh sách mẫu thiệp')
        setTemplates([])
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      // Fallback to premium templates
      setTemplates(allTemplates)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateClick = async (template) => {
    // Check if user is logged in
    if (!user) {
      if (window.confirm('Bạn cần đăng nhập để sử dụng template này. Chuyển đến trang đăng nhập?')) {
        navigate('/login', { state: { from: '/collection', templateId: template.id } })
      }
      return
    }

    // Show editor selection modal
    setSelectedTemplate(template)
    setShowEditorModal(true)
  }

  const handleCreateInvitation = async (editorType) => {
    if (!selectedTemplate) return

    try {
      setCreatingInvitation(true)
      setShowEditorModal(false)
      
      console.log('🎯 Creating invitation from template:', selectedTemplate.name)
      console.log('📝 Editor type:', editorType)
      
      toast.info('⏳ Đang tạo thiệp mời từ template...')
      
      // Create invitation from template via API
      const response = await invitationService.createFromTemplate(selectedTemplate.id, {
        title: `${selectedTemplate.name} - ${user.full_name || 'My Wedding'}`
      })
      
      console.log('✅ Invitation created:', response.data)
      
      toast.success('🎉 Tạo thiệp mời thành công! Đang chuyển đến editor...')
      
      // Navigate to appropriate editor
      setTimeout(() => {
        if (editorType === 'html') {
          navigate(`/html-editor?invitationId=${response.data.id}`)
        } else if (editorType === 'advanced-html') {
          navigate(`/ultimate-html-editor?invitationId=${response.data.id}`)
        } else {
          navigate(`/editor?invitationId=${response.data.id}`)
        }
      }, 500)
    } catch (error) {
      console.error('❌ Failed to create invitation:', error)
      
      if (error.message?.includes('Unauthorized') || error.message?.includes('401') || error.message?.includes('Token')) {
        toast.error('🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        toast.error(`❌ Không thể tạo thiệp mời: ${error.message || 'Vui lòng thử lại'}`)
      }
    } finally {
      setCreatingInvitation(false)
    }
  }

  // Filter and sort templates
  let filteredTemplates = templates
  
  if (selectedCategory) {
    filteredTemplates = filteredTemplates.filter(t => {
      // Handle both API format (category_id) and premium format (category name)
      if (t.category_id) {
        return t.category_id === selectedCategory
      } else if (t.category) {
        const categoryObj = categories.find(c => c.name === t.category)
        return categoryObj && categoryObj.id === selectedCategory
      }
      return false
    })
  }
  
  if (searchQuery) {
    filteredTemplates = filteredTemplates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  
  // Sort
  filteredTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'popular') return (b.usage_count || 0) - (a.usage_count || 0)
    if (sortBy === 'newest') return (b.id || 0) - (a.id || 0)
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <div className="bg-white dark:bg-black font-sans antialiased min-h-screen">
      <Header />

      {/* Hero Section - Minimal */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden mt-16">
        {/* Real wedding photo background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 dark:opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')",
          }}
        ></div>
        
        {/* Monochrome overlay */}
        <div className="absolute inset-0 bg-gray-900/60 dark:bg-black/70"></div>
        
        {/* Minimal decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 border border-white/30 opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 opacity-40"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/40 opacity-40"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Minimal badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-white text-sm font-medium">500+ MẪU THIẾT KẾ CAO CẤP</span>
          </div>

          {/* Clean typography */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 leading-tight" style={{fontFamily: "'Playfair Display', serif"}}>
            Bộ Sưu Tập
            <br/>
            <span className="font-normal">
              Thiệp Cưới
            </span>
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed" style={{fontFamily: "'Playfair Display', serif"}}>
            Khám phá những thiết kế tinh tế, sang trọng được tuyển chọn kỹ lưỡng.<br/>
            Mỗi mẫu thiệp là một tác phẩm nghệ thuật độc đáo.
          </p>

          {/* Clean search bar - professional look */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="flex items-center bg-white shadow-2xl overflow-hidden">
                <div className="pl-6 pr-3 py-5 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, phong cách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-5 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-lg"
                />
                <button className="mr-2 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all">
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Controls - Clean & Professional */}
      <section className="sticky top-16 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-5">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Categories - Clean pills */}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 flex-1 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 px-5 py-2 font-medium transition-all text-sm ${
                  !selectedCategory 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`shrink-0 px-5 py-2 font-medium transition-all text-sm ${
                    selectedCategory === category.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* View Mode & Sort - Clean controls */}
            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-medium outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="name">Tên A-Z</option>
              </select>

              {/* View mode toggle - Grid & List only */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="Grid"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="List"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{filteredTemplates.length}</span> mẫu thiệp
            {selectedCategory && <span> trong danh mục <span className="font-semibold text-gray-900 dark:text-white">{categories.find(c => c.id === selectedCategory)?.name}</span></span>}
          </div>
        </div>
      </section>

      {/* Templates Gallery */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 dark:border-white"></div>
                <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">Đang tải bộ sưu tập...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-32">
              <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không tìm thấy kết quả</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory(null)
                }}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Grid Layout */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredTemplates.map((template, index) => (
                    <div
                      key={template.id}
                      className="group cursor-pointer animate-fade-in"
                      style={{animationDelay: `${index * 0.05}s`}}
                      onClick={() => handleTemplateClick(template)}
                    >
                      <div className="relative bg-gray-50 dark:bg-gray-900 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200 dark:border-gray-800">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={template.thumbnail || template.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <button className="px-6 py-3 bg-white text-gray-900 font-bold shadow-2xl hover:scale-110 transition-transform">
                              Chỉnh Sửa
                            </button>
                          </div>
                          {template.is_premium && (
                            <span className="absolute top-3 left-3 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors truncate" style={{fontFamily: "'Playfair Display', serif"}}>
                            {template.name}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{template.usage_count || 0} lượt dùng</span>
                            <span className={template.is_premium ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400 font-bold'}>
                              {template.is_premium ? 'Premium' : 'Free'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List Layout */}
              {viewMode === 'list' && (
                <div className="space-y-6">
                  {filteredTemplates.map((template, index) => (
                    <div
                      key={template.id}
                      className="group cursor-pointer animate-fade-in"
                      style={{animationDelay: `${index * 0.05}s`}}
                      onClick={() => handleTemplateClick(template)}
                    >
                      <div className="flex gap-6 bg-gray-50 dark:bg-gray-900 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-200 dark:border-gray-800 p-6">
                        <div className="relative w-48 h-64 shrink-0 overflow-hidden">
                          <img
                            src={template.thumbnail || template.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {template.is_premium && (
                            <span className="absolute top-3 left-3 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" style={{fontFamily: "'Playfair Display', serif"}}>
                              {template.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                              {template.description || 'Mẫu thiệp cưới sang trọng, tinh tế với thiết kế hiện đại'}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {template.views_count || 0} lượt xem
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                {template.usage_count || 0} lượt dùng
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-lg font-bold ${template.is_premium ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              {template.is_premium ? 'Premium' : 'Miễn phí'}
                            </span>
                            <button className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Chỉnh Sửa Ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Editor Selection Modal - Clean & Professional */}
      {showEditorModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 shadow-2xl max-w-3xl w-full overflow-hidden">
            {/* Header - Clean */}
            <div className="bg-gray-900 dark:bg-white p-8 text-white dark:text-black">
              <h2 className="text-3xl font-bold mb-2" style={{fontFamily: "'Playfair Display', serif"}}>Chọn Loại Editor</h2>
              <p className="text-white/90 dark:text-black/90 text-lg">Bạn muốn chỉnh sửa template bằng cách nào?</p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Canvas Editor Option */}
                <button
                  onClick={() => handleCreateInvitation('canvas')}
                  disabled={creatingInvitation}
                  className="group relative p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:shadow-lg transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Canvas Editor</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kéo thả, chỉnh sửa từng element. Dễ dùng.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">Dễ dùng</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">Drag & Drop</span>
                    </div>
                  </div>
                </button>

                {/* HTML Editor Option */}
                <button
                  onClick={() => handleCreateInvitation('html')}
                  disabled={creatingInvitation}
                  className="group relative p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:shadow-lg transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 dark:bg-gray-300 flex items-center justify-center text-white dark:text-black group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">HTML Editor</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Điền form đơn giản. Template có sẵn.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">Đơn giản</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">Form</span>
                    </div>
                  </div>
                </button>

                {/* Advanced HTML Editor Option */}
                <button
                  onClick={() => handleCreateInvitation('advanced-html')}
                  disabled={creatingInvitation}
                  className="group relative p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:shadow-lg transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ultimate Editor</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Form thông minh + Upload ảnh + Real-time preview
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">Đỉnh cao</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">Real-time</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditorModal(false)
                  setSelectedTemplate(null)
                }}
                disabled={creatingInvitation}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionPage
