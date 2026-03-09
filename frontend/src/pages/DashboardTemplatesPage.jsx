import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import adminService from '../services/admin.service'
import templateService from '../services/template.service'
import { useToast } from '../context/ToastContext'

const DashboardTemplatesPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const initialPage = Math.max(1, Number(searchParams.get('page') || 1))
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pagination, setPagination] = useState({ currentPage: initialPage, totalPages: 1 })
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const [showFilters, setShowFilters] = useState(false) // Collapsed by default
  const [templatesCount, setTemplatesCount] = useState(0)
  
  // Auto list view on mobile
  const getInitialViewMode = () => {
    return window.innerWidth < 768 ? 'list' : 'grid'
  }
  const [viewMode, setViewMode] = useState(getInitialViewMode())

  const categories = [
    { value: 'wedding', label: 'Thiệp cưới' },
    { value: 'birthday', label: 'Sinh nhật' },
    { value: 'anniversary', label: 'Kỷ niệm' },
    { value: 'graduation', label: 'Tốt nghiệp' },
    { value: 'business', label: 'Doanh nghiệp' },
    { value: 'other', label: 'Khác' }
  ]

  useEffect(() => {
    loadTemplates()
  }, [filters, currentPage])

  useEffect(() => {
    const pageFromUrl = Math.max(1, Number(searchParams.get('page') || 1))
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl)
    }
  }, [searchParams, currentPage])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllTemplates({ ...filters, page: currentPage })
      let data = response.data || []
      let pagination = response.pagination || []

      // Map category_id to category string for filtering
      data = data.map(template => {
        const categoryMap = {
          1: 'wedding',
          2: 'birthday',
          3: 'anniversary',
          4: 'graduation',
          5: 'business',
          6: 'other'
        }
        return {
          ...template,
          category: categoryMap[template.category_id] || 'other',
          thumbnail: template.thumbnail_url // Map thumbnail_url to thumbnail
        }
      })

      setTemplates(data)
      setTemplatesCount(pagination.total || data.length) // Use total from API if available, otherwise fallback to data length

      const paginationMeta = response.pagination || response.meta || {}
      const totalPagesFromApi = Number(paginationMeta.total_pages || paginationMeta.last_page || 0)
      const currentPageFromApi = Number(paginationMeta.current_page || paginationMeta.page || currentPage)

      setPagination({
        currentPage: currentPageFromApi > 0 ? currentPageFromApi : currentPage,
        totalPages: totalPagesFromApi > 0 ? totalPagesFromApi : Math.max(1, currentPage)
      })
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Không thể tải danh sách templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTemplates(templates.map(template => template.id))
    } else {
      setSelectedTemplates([])
    }
  }

  const handleSelectTemplate = (id, checked) => {
    if (checked) {
      setSelectedTemplates([...selectedTemplates, id])
    } else {
      setSelectedTemplates(selectedTemplates.filter(templateId => templateId !== id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedTemplates.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một template')
      return
    }

    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedTemplates.map(id =>
            adminService.updateTemplateStatus(id, 'active')
          ))
          toast.success(`Đã kích hoạt ${selectedTemplates.length} templates`)
          break
        case 'deactivate':
          await Promise.all(selectedTemplates.map(id =>
            adminService.updateTemplateStatus(id, 'inactive')
          ))
          toast.success(`Đã vô hiệu hóa ${selectedTemplates.length} templates`)
          break
        case 'delete':
          if (window.confirm(`Bạn có chắc muốn xóa ${selectedTemplates.length} templates?`)) {
            // Map selected IDs to templates to get uuid
            const templatesToDelete = templates.filter(t => selectedTemplates.includes(t.id));
            await Promise.all(templatesToDelete.map(template =>
              templateService.delete(template.uuid || template.id)
            ))
            toast.success(`Đã xóa ${selectedTemplates.length} templates`)
          }
          break
      }
      setSelectedTemplates([])
      loadTemplates()
    } catch (error) {
      console.error('Bulk action failed:', error)
      toast.error('Có lỗi xảy ra khi thực hiện hành động')
    }
  }

  const handleCreateTemplate = async () => {
    navigate('/dashboard/templates/create')
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return

    try {
      // Use uuid if available, otherwise use id
      const identifier = templateToDelete.uuid || templateToDelete.id;
      await templateService.delete(identifier)
      toast.success('Đã xóa template thành công')
      setShowDeleteModal(false)
      setTemplateToDelete(null)
      loadTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Không thể xóa template')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: '', color: 'bg-green-500 dark:bg-green-600' },
      inactive: { text: '', color: 'bg-red-500 dark:bg-red-600' },
      draft: { text: '', color: 'bg-yellow-500 dark:bg-yellow-600' }
    }
    const badge = badges[status] || badges.draft
    return (
      <span className={`inline-block w-2 h-2 rounded-full ${badge.color}`} title={status === 'active' ? 'Hoạt động' : status === 'inactive' ? 'Vô hiệu hóa' : 'Nháp'}></span>
    )
  }

  const getTemplateIdentifier = (template) => template?.template_id || template?.id || template?.uuid || template?.slug

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const setPageAndSyncUrl = (page) => {
    const safePage = Math.max(1, Number(page) || 1)
    setCurrentPage(safePage)

    const nextParams = new URLSearchParams(searchParams)
    if (safePage <= 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(safePage))
    }
    setSearchParams(nextParams)
  }

  const handlePageChange = (nextPage) => {
    if (loading) return
    if (nextPage < 1) return
    if (pagination.totalPages > 0 && nextPage > pagination.totalPages) return
    setPageAndSyncUrl(nextPage)
  }

  const pageNumbers = (() => {
    const total = Math.max(1, pagination.totalPages || 1)
    const current = Math.max(1, pagination.currentPage || 1)
    const start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)
    const realStart = Math.max(1, end - 4)
    return Array.from({ length: end - realStart + 1 }, (_, i) => realStart + i)
  })()

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý Templates</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quản lý tất cả templates trong hệ thống</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/templates/create')}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Tạo Template mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tổng Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{templatesCount}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-900/20">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {templates.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Thiệp cưới</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {templates.filter(t => t.category === 'wedding').length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 dark:bg-orange-900/20">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Lượt sử dụng</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
            </div>
          </div>
        </div>

        {/* Filters - Collapsible */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Header with toggle */}
          <div 
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                {showFilters ? 'expand_less' : 'tune'}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bộ lọc {showFilters ? '' : `(${templates.length} templates)`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!showFilters && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {filters.category !== 'all' && `${categories.find(c => c.value === filters.category)?.label} • `}
                  {filters.status !== 'all' && `${filters.status} • `}
                  {filters.search && `"${filters.search}"`}
                </span>
              )}
              <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewMode('grid')
                  }}
                  className={`p-1 rounded-md transition-all ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  title="Grid View"
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewMode('list')
                  }}
                  className={`p-1 rounded-md transition-all ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  title="List View"
                >
                  <span className="material-symbols-outlined text-lg">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible content */}
          {showFilters && (
            <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPageAndSyncUrl(1); }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none rounded-lg"
                  >
                    <option value="all">Tất cả</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPageAndSyncUrl(1); }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none rounded-lg"
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Vô hiệu hóa</option>
                    <option value="draft">Nháp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sắp xếp
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => { setFilters({ ...filters, sortBy: e.target.value }); setPageAndSyncUrl(1); }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none rounded-lg"
                  >
                    <option value="created_at">Ngày tạo</option>
                    <option value="updated_at">Cập nhật</option>
                    <option value="name">Tên</option>
                    <option value="category">Danh mục</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Thứ tự
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => { setFilters({ ...filters, sortOrder: e.target.value }); setPageAndSyncUrl(1); }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none rounded-lg"
                  >
                    <option value="desc">Mới nhất</option>
                    <option value="asc">Cũ nhất</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    placeholder="Tìm..."
                    value={filters.search}
                    onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPageAndSyncUrl(1); }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none rounded-lg"
                  />
                </div>
              </div>
              
              {/* Clear filters button */}
              {(filters.category !== 'all' || filters.status !== 'all' || filters.search) && (
                <button
                  onClick={() => { setFilters({ ...filters, category: 'all', status: 'all', search: '' }); setPageAndSyncUrl(1); }}
                  className="mt-3 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedTemplates.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Đã chọn {selectedTemplates.length} templates
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                >
                  Kích hoạt
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                >
                  Vô hiệu hóa
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <div className="p-6">
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {templates.map((template) => (
                    <div key={getTemplateIdentifier(template)} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.includes(template.id)}
                          onChange={(e) => handleSelectTemplate(template.id, e.target.checked)}
                          className="absolute top-3 left-3 w-5 h-5 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white z-10 cursor-pointer"
                        />
                        <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {template.thumbnail ? (
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.innerHTML = '<svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>'
                              }}
                            />
                          ) : (
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                            {template.name}
                          </h3>
                          {getStatusBadge(template.status)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {getCategoryLabel(template.category)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {template.description || 'Không có mô tả'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                          <span>ID: {template.template_id || template.id}</span>
                          <span>{formatDate(template.created_at)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/templates/edit/${encodeURIComponent(getTemplateIdentifier(template))}`)}
                            className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => {
                              setTemplateToDelete(template)
                              setShowDeleteModal(true)
                            }}
                            className="px-4 py-2.5 text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors rounded"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div key={getTemplateIdentifier(template)} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow rounded-lg overflow-hidden flex h-20">
                      {/* Checkbox & Thumbnail - Compact */}
                      <div className="relative w-20 shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.includes(template.id)}
                          onChange={(e) => handleSelectTemplate(template.id, e.target.checked)}
                          className="absolute top-1 left-1 w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white z-10 cursor-pointer"
                        />
                        {template.thumbnail ? (
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Content - Compact */}
                      <div className="flex-1 px-3 py-2 flex items-center gap-3 min-w-0">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-0.5">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="truncate">{getCategoryLabel(template.category)}</span>
                            <span className="shrink-0">ID: {template.template_id || template.id}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {getStatusBadge(template.status)}
                        </div>

                        {/* Actions - Vertical Stack */}
                        <div className="flex flex-col gap-1 shrink-0 w-16">
                          <button
                            onClick={() => navigate(`/dashboard/templates/edit/${encodeURIComponent(getTemplateIdentifier(template))}`)}
                            className="w-full px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => {
                              setTemplateToDelete(template)
                              setShowDeleteModal(true)
                            }}
                            className="w-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors rounded"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {templates.length > 0 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange((pagination.currentPage || currentPage) - 1)}
                    disabled={loading || (pagination.currentPage || currentPage) <= 1}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40"
                  >
                    Trước
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm rounded-md border ${
                        page === (pagination.currentPage || currentPage)
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-black border-gray-900 dark:border-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange((pagination.currentPage || currentPage) + 1)}
                    disabled={loading || (pagination.totalPages > 0 && (pagination.currentPage || currentPage) >= pagination.totalPages)}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              )}
              {templates.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không có template nào</h3>
                  <p className="text-gray-500 dark:text-gray-400">Bắt đầu tạo template đầu tiên của bạn</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Xác nhận xóa template
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bạn có chắc chắn muốn xóa template "{templateToDelete?.name}"?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setTemplateToDelete(null)
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteTemplate}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default DashboardTemplatesPage








