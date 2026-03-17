import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import adminService from '../services/admin.service'
import templateService from '../services/template.service'
import { useToast } from '../context/ToastContext'
import CategoryManageModal from './CategoryManageModal'

const CategoryPage = () => {
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
  const [categories, setCategories] = useState([])
  const [openModalCategory, setOpenModalCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const handleCreateCategory = async (data) => {
    await templateService.createCategory(data)
    loadCategories()
  }

  const handleUpdateCategory = async (data) => {
    await templateService.updateCategory(editingCategory.value, data)
    setEditingCategory(null)
    loadCategories()
  }

  // Auto list view on mobile
  const getInitialViewMode = () => {
    return window.innerWidth < 768 ? 'list' : 'grid'
  }
  const [viewMode, setViewMode] = useState(getInitialViewMode())

  const loadCategories = async () => {
    try {
      const response = await templateService.getCategories()

      const categoryData = (response.data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        display_order: cat.display_order,
        slug: cat.slug,
        deleted_at: cat.deleted_at
      }))

      // const filteredData = categoryData.filter(cat => !cat.deleted_at)

      setCategories(categoryData)
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
      console.error('Failed to load categories:', error)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [filters, currentPage])

  useEffect(() => {
    loadCategories()
    // if (decodedId) {
    //   loadTemplate(decodedId)
    // }
  }, [])

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

      data = data.map(template => ({
        ...template,
        category: template.category_id, // dùng id luôn
        thumbnail: template.thumbnail_url
      }))
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Không thể tải danh sách templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa category này?")) return

    try {
      await templateService.deleteCategory(id)
      toast.success("Xóa category thành công")
      loadCategories()
    } catch (error) {
      console.error(error)
      toast.error("Không thể xóa category")
    }
  }

  const handleEditCategory = (category) => {
    navigate(`/dashboard/categories/edit/${category.value}`)
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý Category</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quản lý tất cả category trong hệ thống</p>
          </div>
          <button
            onClick={() => setOpenModalCategory(true)}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Tạo Category mới
          </button>
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
                Bộ lọc
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!showFilters && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {filters.category !== 'all' && `${categories.find(c => c.value === filters.category)?.name} • `}
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
                      <option key={cat.value} value={cat.value}>{cat.name}</option>
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
                  {categories.map((category) => (
                    <div
                      key={category.value}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition flex flex-col h-full"      >
                      {(() => {
                        const isDeleted = Boolean(category.deleted_at)
                        return (
                          <>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              slug: {category.slug}
                            </p>

                            <div className="mt-3 text-xs text-gray-400">
                              mô tả: {category.description}
                            </div>

                            <div className="mt-auto pt-3 space-y-2">
                              <span className={`text-[11px] ${isDeleted ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                Delete at : {category.deleted_at ? formatDate(category.deleted_at) : 'N/A'}
                              </span>

                              {/* ACTIONS */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (isDeleted) return
                                    setEditingCategory(category)
                                    setOpenModalCategory(true)
                                  }}
                                  disabled={isDeleted}
                                  className={`flex-1 px-2 py-1 text-xs rounded ${isDeleted
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>

                                <button
                                  onClick={() => {
                                    if (isDeleted) return
                                    handleDeleteCategory(category.id)
                                  }}
                                  disabled={isDeleted}
                                  className={`flex-1 px-2 py-1 text-xs rounded ${isDeleted
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.value}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                    >
                      {/* Left */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                            folder
                          </span>
                        </div>

                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            slug: {category.slug}
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-xs text-gray-400">
                        description: {category.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {categories.length > 0 && (
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
                      className={`px-3 py-1.5 text-sm rounded-md border ${page === (pagination.currentPage || currentPage)
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
            </div>
          )}
        </div>
      </div>

      <CategoryManageModal
        isOpen={openModalCategory}
        initialData={editingCategory}
        onClose={() => {
          setOpenModalCategory(false)
          setEditingCategory(null)
        }}
        onCreate={editingCategory ? handleUpdateCategory : handleCreateCategory}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setTemplateToDelete(null) }}
        title="Xác nhận xóa"
        footer={
          <>
            <button
              onClick={() => { setShowDeleteModal(false); setTemplateToDelete(null) }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteTemplate}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg"
            >
              Xóa
            </button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Bạn có chắc chắn muốn xóa &quot;{templateToDelete?.name}&quot;?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </DashboardLayout>
  )
}

export default CategoryPage








