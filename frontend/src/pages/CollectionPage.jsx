import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import templateService from '../services/template.service'
import invitationService from '../services/invitation.service'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const CollectionPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const toast = useToast()

  // Default to list view on mobile, grid on desktop
  const getInitialViewMode = () => {
    return window.innerWidth < 768 ? 'list' : 'grid'
  }

  const [viewMode, setViewMode] = useState(getInitialViewMode())
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingInvitation, setCreatingInvitation] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortBy, setSortBy] = useState('popular') // popular, newest, name
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null) // For full-screen preview
  const initialPage = Math.max(1, Number(searchParams.get('page') || 1))
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pagination, setPagination] = useState({ currentPage: initialPage, totalPages: 1, totalItems: 0 })
  const shouldScrollOnPageChangeRef = useRef(false)

  useEffect(() => {
    loadData()
  }, [currentPage, selectedCategory, sortBy, searchQuery, viewMode])

  useEffect(() => {
    const pageFromUrl = Math.max(1, Number(searchParams.get('page') || 1))
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl)
    }
  }, [searchParams, currentPage])

  useEffect(() => {
    if (!shouldScrollOnPageChangeRef.current) return
    shouldScrollOnPageChangeRef.current = false
    window.scrollTo({
      top: 450,
      behavior: 'smooth'
    })
  }, [currentPage])

  useEffect(() => {
    if (!searchParams.get('page')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('page', '1')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const loadData = async () => {
    try {
      setLoading(true)

      const sortMap = {
        popular: 'usage_count',
        newest: 'id',
        name: 'name'
      }

      const requestFilters = {
        is_active: 1,
        page: currentPage,
        limit: viewMode === 'grid' ? 12 : 10,
        sort_by: sortMap[sortBy] || 'usage_count',
        sort_order: sortBy === 'name' ? 'asc' : 'desc'
      }

      if (selectedCategory) {
        requestFilters.category_id = selectedCategory
      }

      if (searchQuery.trim()) {
        requestFilters.search = searchQuery.trim()
      }

      const [templatesRes, categoriesRes] = await Promise.all([
        templateService.getAll(requestFilters),
        templateService.getCategories()
      ])

      const templatePayload = templatesRes?.data
      const templateRows = Array.isArray(templatePayload)
        ? templatePayload
        : Array.isArray(templatePayload?.items)
          ? templatePayload.items
          : Array.isArray(templatesRes?.items)
            ? templatesRes.items
            : []

      const apiTemplates = templateRows.map(template => {
        try {
          const designData = typeof template.design_data === 'string'
            ? JSON.parse(template.design_data)
            : template.design_data

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
            designData,
            html_template: template.html_template,
            tags
          }
        } catch (err) {
          console.error('Failed to parse template', template?.id, err)
          return null
        }
      }).filter(Boolean)

      const rawCategories = categoriesRes?.data || []
      const activeCategories = Array.isArray(rawCategories)
        ? rawCategories.filter((category) => !category?.deleted_at)
        : []

      setTemplates(apiTemplates)
      setCategories(activeCategories)

      const paginationMeta = templatesRes?.pagination
        || templatesRes?.meta
        || templatePayload?.pagination
        || templatePayload?.meta
        || {}

      const totalPagesFromApi = Number(
        paginationMeta.total_pages
        || paginationMeta.last_page
        || paginationMeta.totalPages
        || paginationMeta.totalPage
        || 0
      )

      const currentPageFromApi = Number(
        paginationMeta.current_page
        || paginationMeta.page
        || paginationMeta.currentPage
        || currentPage
      )

      const totalItemsFromApi = Number(
        paginationMeta.total
        || paginationMeta.total_items
        || paginationMeta.totalItems
        || templatePayload?.total
        || apiTemplates.length
      )

      setPagination({
        currentPage: currentPageFromApi > 0 ? currentPageFromApi : currentPage,
        totalPages: totalPagesFromApi > 0 ? totalPagesFromApi : 1,
        totalItems: Number.isFinite(totalItemsFromApi) ? totalItemsFromApi : apiTemplates.length
      })
    } catch (apiError) {
      console.error('❌ API Error:', apiError)
      toast.error('Không thể tải danh sách mẫu thiệp')
      setTemplates([])
      setCategories([])
      setPagination({ currentPage, totalPages: 1, totalItems: 0 })
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

    // Show editor selection modal directly (no name input)
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

      // Generate slug from template name
      const slug = `${selectedTemplate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      const title = `${selectedTemplate.name}`;

      console.log('📤 Creating with:', { template_id: selectedTemplate.id, title, slug });

      // Create invitation from template via API
      const response = await invitationService.createFromTemplate(selectedTemplate.id, {
        title,
        slug
      })

      console.log('✅ Invitation created:', response)

      toast.success('🎉 Tạo thiệp mời thành công! Đang tải...')

      // API doesn't return invitation data, need to fetch the latest invitation
      // Get all invitations and find the one we just created by slug
      const invitationsResponse = await invitationService.getAll({ limit: 10, sort_by: 'created_at', sort_dir: 'DESC' });

      console.log('📋 Fetched invitations:', invitationsResponse);

      // Find invitation by slug (the one we just created)
      const invitations = invitationsResponse.data || invitationsResponse;
      const newInvitation = Array.isArray(invitations)
        ? invitations.find(inv => inv.slug === slug)
        : null;

      if (!newInvitation || !newInvitation.uuid) {
        console.warn('⚠️ Could not find newly created invitation, redirecting to management');
        setTimeout(() => navigate('/management'), 500);
        return;
      }

      console.log('✅ Found new invitation:', newInvitation);

      // Check if invitation has html_content
      if (!newInvitation.html_content) {
        console.warn('⚠️ Invitation has no HTML content, need to copy from template');

        // Get template HTML content from the selectedTemplate we already have
        let templateHtml = selectedTemplate?.html_template; // Template uses html_template

        // If selectedTemplate has no html_template, try to get from designData
        if (!templateHtml && selectedTemplate?.designData?.html) {
          console.log('📄 Using HTML from template designData...');
          templateHtml = selectedTemplate.designData.html;
        }

        if (templateHtml) {
          console.log('📄 Copying HTML from template to invitation...');
          console.log('🔑 Using UUID:', newInvitation.uuid);
          console.log('📝 HTML length:', templateHtml.length);

          try {
            // Update invitation with template HTML - WAIT for completion
            // Invitation uses html_content (not html_template)
            const updateData = {
              html_content: templateHtml, // Invitation uses html_content
              title: newInvitation.title || title,
              slug: newInvitation.slug || slug,
              status: 'draft'
            };

            console.log('📤 Sending update data:', Object.keys(updateData));

            await invitationService.update(newInvitation.uuid, updateData);

            console.log('✅ HTML content copied successfully');
            toast.success('✅ Đã sao chép nội dung từ template');
          } catch (err) {
            console.error('❌ Failed to copy template HTML:', err);
            console.error('❌ Error details:', err.message);
            toast.error('⚠️ Không thể sao chép nội dung template');
          }
        } else {
          console.warn('⚠️ Template has no HTML content to copy');
          toast.warning('⚠️ Template không có nội dung HTML. Vui lòng liên hệ admin để thêm nội dung cho template này.');
        }
      }

      // Navigate to appropriate editor using UUID - wait a bit for update to propagate
      setTimeout(() => {
        if (editorType === 'html') {
          navigate(`/html-editor?invitationId=${newInvitation.uuid}`)
        } else if (editorType === 'advanced-html') {
          navigate(`/ultimate-html-editor?invitationId=${newInvitation.uuid}`)
        } else {
          navigate(`/editor?invitationId=${newInvitation.uuid}`)
        }
      }, 1000)
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

  // if (selectedCategory) {
  //   filteredTemplates = filteredTemplates.filter(t => {
  //     // Handle both API format (category_id) and premium format (category name)
  //     if (t.category_id) {
  //       return t.category_id === selectedCategory
  //     } else if (t.category) {
  //       const categoryObj = categories.find(c => c.name === t.category)
  //       return categoryObj && categoryObj.id === selectedCategory
  //     }
  //     return false
  //   })
  // }

  if (searchQuery) {
    filteredTemplates = filteredTemplates.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort
  // filteredTemplates = [...filteredTemplates].sort((a, b) => {
  //   if (sortBy === 'popular') return (b.usage_count || 0) - (a.usage_count || 0)
  //   if (sortBy === 'newest') return (b.id || 0) - (a.id || 0)
  //   if (sortBy === 'name') return a.name.localeCompare(b.name)
  //   return 0
  // })

  const pageSize = viewMode === 'grid' ? 12 : 10
  const hasServerPagination = Number(pagination.totalPages || 0) > 1 || Number(pagination.totalItems || 0) > filteredTemplates.length
  const totalPages = hasServerPagination
    ? Math.max(1, Number(pagination.totalPages) || 1)
    : Math.max(1, Math.ceil(filteredTemplates.length / pageSize))
  const normalizedCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (normalizedCurrentPage - 1) * pageSize
  const paginatedTemplates = hasServerPagination
    ? filteredTemplates
    : filteredTemplates.slice(startIndex, startIndex + pageSize)
  const totalTemplateCount = hasServerPagination
    ? Math.max(Number(pagination.totalItems || 0), filteredTemplates.length)
    : filteredTemplates.length

  const setPageAndSyncUrl = (page) => {
    const safePage = Math.max(1, Number(page) || 1)
    setCurrentPage(safePage)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(safePage))
    setSearchParams(nextParams)
  }

  const handlePageChange = (nextPage) => {
    if (loading) return
    if (nextPage < 1) return
    if (nextPage > totalPages) return
    shouldScrollOnPageChangeRef.current = true
    setPageAndSyncUrl(nextPage)
  }

  const pageNumbers = (() => {
    const start = Math.max(1, normalizedCurrentPage - 2)
    const end = Math.min(totalPages, start + 4)
    const realStart = Math.max(1, end - 4)
    return Array.from({ length: end - realStart + 1 }, (_, i) => realStart + i)
  })()

  useEffect(() => {
    if (normalizedCurrentPage !== currentPage) {
      setPageAndSyncUrl(normalizedCurrentPage)
    }
  }, [normalizedCurrentPage])

  return (
    <div className="bg-white dark:bg-black font-sans antialiased min-h-screen">
      <Header />

      {/* Hero Section - Wedding Background */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Wedding Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070')",
          }}
        ></div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 md:pt-32 pb-12 w-full">



          {/* Typography */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-white mb-6 leading-tight drop-shadow-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Kho Giao Diện <br className="md:hidden" />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 font-sans font-bold italic">
              Cao Cấp
            </span>
          </h1>

          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light tracking-wide">
            Hệ thống mẫu thiệp được tối ưu hóa cho trải nghiệm người dùng tốt nhất.
          </p>

          {/* Clean Rounded Search Bar - Command Palette Style */}
          <div className="max-w-2xl mx-auto w-full relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center w-full h-12 md:h-16 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl transition-all">
              <div className="grid place-items-center h-full w-14 text-gray-400 shrink-0">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                className="peer h-full w-full outline-none text-base text-white placeholder-gray-500 bg-transparent font-mono"
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPageAndSyncUrl(1); }}
                placeholder="Tìm kiếm theo tên hoặc mã số..."
              />
              <button className="h-[calc(100%-8px)] px-6 md:px-8 m-1 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors shrink-0 uppercase tracking-wider">
                Search
              </button>
            </div>
            <div className="mt-3 flex gap-4 justify-center text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              <span>Press Enter to search</span>
              <span>•</span>
              <span>Type 'Premium' for vip</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Controls - Clean & Professional */}
      <section className="sticky top-16 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-all">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 md:py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Categories - Clean pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 flex-1 w-full md:w-auto hide-scrollbar mask-gradient-right">
              <button
                onClick={() => { setSelectedCategory(null); setPageAndSyncUrl(1); }}
                className={`shrink-0 px-4 py-2 text-sm font-bold rounded-full transition-all whitespace-nowrap ${!selectedCategory
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => { setSelectedCategory(category.id); }}
                  className={`shrink-0 px-4 py-2 text-sm font-bold rounded-full transition-all whitespace-nowrap ${selectedCategory === category.id
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* View Mode & Sort - Clean controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Sort dropdown */}
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPageAndSyncUrl(1); }}
                  className="appearance-none pl-4 pr-10 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="name">Tên A-Z</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none">expand_more</span>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                    ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  title="Grid View"
                >
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                    ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  title="List View"
                >
                  <span className="material-symbols-outlined text-xl">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{paginatedTemplates.length}</span>/<span className="font-semibold text-gray-900 dark:text-white">{totalTemplateCount}</span> mẫu thiệp
            {selectedCategory && <span> trong danh mục <span className="font-semibold text-gray-900 dark:text-white">{categories.find(c => c.id === selectedCategory)?.name}</span></span>}
          </div>
        </div>
      </section>

      {/* Templates Gallery */}
      <section className="py-8 md:py-12 bg-white dark:bg-black">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                <p className="mt-6 text-gray-500 text-sm font-medium uppercase tracking-widest">Đang tải...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-32 opacity-60">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory(null)
                  setPageAndSyncUrl(1)
                }}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-full"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Grid Layout */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={template.thumbnail || template.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'}
                          alt={template.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        {/* Overlay Actions (Desktop) */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button className="px-6 py-2 bg-white text-black font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            Sử dụng
                          </button>
                        </div>

                        {template.is_premium && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider rounded">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2 flex-1">
                            {template.name}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">
                          <span>{template.category || 'Wedding'}</span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            {template.views_count || 0}
                          </span>
                        </div>
                        {/* Preview Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTemplate(template)
                          }}
                          className="w-full py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          Xem mẫu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List Layout */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {paginatedTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className="group cursor-pointer bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex h-32 md:h-48"
                    >
                      {/* Image - Fixed Width */}
                      <div className="relative w-32 md:w-48 shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-800">
                        <img
                          src={template.thumbnail || template.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                        {template.is_premium && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 text-white text-[9px] md:text-[10px] font-bold uppercase rounded">
                            Premium
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 md:p-6 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-sm md:text-xl text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors">
                              {template.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 md:line-clamp-none mb-2">
                              {template.description || 'Mẫu thiệp cưới sang trọng, tinh tế.'}
                            </p>
                          </div>
                          <div className="hidden md:flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewTemplate(template)
                              }}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              Xem mẫu
                            </button>
                            <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase rounded-full">
                              Sử dụng
                            </button>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center gap-4 text-[10px] md:text-xs text-gray-400 font-mono">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">category</span>
                            {template.category || 'General'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            {template.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">favorite</span>
                            {template.usage_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(normalizedCurrentPage - 1)}
                    disabled={normalizedCurrentPage <= 1}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Trước
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-10 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${page === normalizedCurrentPage
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(normalizedCurrentPage + 1)}
                    disabled={normalizedCurrentPage >= totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Sau
                  </button>
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-gradient-right {
          mask-image: linear-gradient(to right, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
        }
      `}</style>


      {/* Editor Selection Modal */}
      <Modal
        isOpen={showEditorModal && !!selectedTemplate}
        onClose={() => { setShowEditorModal(false); setSelectedTemplate(null) }}
        title="Chọn Loại Editor"
        size="2xl"
        footer={
          <button
            onClick={() => { setShowEditorModal(false); setSelectedTemplate(null) }}
            disabled={creatingInvitation}
            className="px-4 py-2 md:px-6 md:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium rounded-lg"
          >
            Hủy
          </button>
        }
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">Bạn muốn chỉnh sửa template bằng cách nào?</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 max-w-2xl mx-auto">
          {/* Canvas Editor Option */}
          <button
            onClick={() => handleCreateInvitation('canvas')}
            disabled={creatingInvitation}
            className="group relative p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:shadow-lg transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">Canvas Editor</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Kéo thả, chỉnh sửa từng element. Dễ dùng.</p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">Dễ dùng</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">Drag & Drop</span>
              </div>
            </div>
          </button>

          {/* Ultimate Editor Option */}
          <button
            onClick={() => handleCreateInvitation('advanced-html')}
            disabled={creatingInvitation}
            className="group relative p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:shadow-lg transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">Ultimate Editor</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Form thông minh + Upload ảnh + Real-time preview</p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">Đỉnh cao</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">Real-time</span>
              </div>
            </div>
          </button>
        </div>
      </Modal>

      {/* Full-Screen Preview Modal with Auto-Scroll */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Back Button - Fixed at top */}
          <button
            onClick={() => setPreviewTemplate(null)}
            className="fixed top-4 left-4 z-[10000] flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-all group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-bold">Quay lại</span>
          </button>

          {/* Template Info - Fixed at top right */}
          <div className="fixed top-4 right-4 z-[10000] px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{previewTemplate.name}</span>
          </div>

          {/* Iframe Container with Auto-Scroll Animation */}
          <div className="w-full h-full overflow-hidden">
            <iframe
              srcDoc={
                previewTemplate.html_template ||
                previewTemplate.designData?.html ||
                (previewTemplate.designData?.elements ?
                  `<html><body style="margin:0;padding:20px;font-family:sans-serif;">
                    <h1>Canvas Template Preview</h1>
                    <p>This is a canvas-based template with ${Object.keys(previewTemplate.designData.elements || {}).length} elements.</p>
                    <p>Canvas templates need to be opened in the editor to view properly.</p>
                  </body></html>`
                  : '<html><body><div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;flex-direction:column;gap:20px;"><svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><div style="text-align:center;"><div style="font-size:18px;font-weight:bold;margin-bottom:8px;">Không có nội dung preview</div><div style="font-size:14px;color:#999;">Template này chưa có HTML để hiển thị</div></div></div></body></html>')
              }
              className="w-full h-full border-0 bg-white"
              title={`Preview ${previewTemplate.name}`}
              onLoad={(e) => {
                // Auto-scroll animation from top to bottom
                const iframe = e.target
                const iframeWindow = iframe.contentWindow
                if (iframeWindow) {
                  let autoScrollActive = true
                  let animationFrameId = null

                  // Detect user scroll to stop auto-scroll
                  const handleUserScroll = () => {
                    if (autoScrollActive) {
                      autoScrollActive = false
                      if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId)
                      }
                      console.log('🛑 Auto-scroll stopped by user interaction')
                    }
                  }

                  // Listen for user scroll events
                  iframeWindow.addEventListener('wheel', handleUserScroll, { passive: true })
                  iframeWindow.addEventListener('touchstart', handleUserScroll, { passive: true })
                  iframeWindow.addEventListener('keydown', (e) => {
                    // Stop on arrow keys, page up/down, space
                    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '].includes(e.key)) {
                      handleUserScroll()
                    }
                  })

                  // Wait a bit for content to load
                  setTimeout(() => {
                    try {
                      const scrollHeight = iframeWindow.document.documentElement.scrollHeight
                      const viewportHeight = iframeWindow.innerHeight
                      const scrollDistance = scrollHeight - viewportHeight

                      if (scrollDistance > 0 && autoScrollActive) {
                        // Slower scroll: 10 pixels per second (was 3)
                        const scrollDuration = Math.min(scrollDistance * 10, 30000) // Max 30 seconds (was 15)

                        let startTime = null
                        const animateScroll = (currentTime) => {
                          if (!autoScrollActive) return // Stop if user interacted

                          if (!startTime) startTime = currentTime
                          const elapsed = currentTime - startTime
                          const progress = Math.min(elapsed / scrollDuration, 1)

                          // Smoother easing function
                          const easeInOutQuad = progress < 0.5
                            ? 2 * progress * progress
                            : 1 - Math.pow(-2 * progress + 2, 2) / 2

                          iframeWindow.scrollTo(0, scrollDistance * easeInOutQuad)

                          if (progress < 1 && autoScrollActive) {
                            animationFrameId = requestAnimationFrame(animateScroll)
                          } else if (autoScrollActive) {
                            // Scroll back to top after reaching bottom
                            setTimeout(() => {
                              if (autoScrollActive) {
                                iframeWindow.scrollTo({ top: 0, behavior: 'smooth' })
                              }
                            }, 2000) // Wait 2 seconds at bottom
                          }
                        }

                        animationFrameId = requestAnimationFrame(animateScroll)
                      }
                    } catch (error) {
                      console.error('Auto-scroll error:', error)
                    }
                  }, 1000) // Wait 1 second before starting
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionPage













