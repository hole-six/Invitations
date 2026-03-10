import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import adminService from '../services/admin.service'
import invitationService from '../services/invitation.service'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const DashboardInvitationsPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [invitations, setInvitations] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInvitations, setSelectedInvitations] = useState([])
  // const [filters, setFilters] = useState({
  //   status: 'all',
  //   search: '',
  //   sortBy: 'created_at',
  //   sortOrder: 'desc',
  //   userId: 'all' // Add user filter
  // })
  const [filters, setFilters] = useState({
  status: 'all',
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  userId: 'all',
  page: 1
})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [invitationToDelete, setInvitationToDelete] = useState(null)

  const [pagination, setPagination] = useState({
  currentPage: 1,
  perPage: 10,
  total: 0,
  totalPages: 1
})

  useEffect(() => {
    if (isAdmin) {
      loadUsers() // Load users list for admin only
    }
    loadInvitations()
  }, [filters, isAdmin])

  const loadUsers = async () => {
    try {
      const response = await adminService.getAllUsers()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadInvitations = async () => {
    try {
      setLoading(true)
      let response
      
      if (isAdmin) {
        // Admin: get all invitations
        response = await adminService.getAllInvitations(filters)
      } else {
        // Regular user: get only their invitations
        response = await invitationService.getAll(filters)
      }
      
      // apiService returns raw JSON (not axios), so handle both shapes
      // Possible shapes:
      // 1) { code, data: [...], pagination: {...} }
      // 2) { data: {...} } (axios-like)
      // 3) [...] (array)
      const res = response?.data ?? response ?? {}
      const list = Array.isArray(res) ? res : (res.data || [])
      setInvitations(list)

      if (res.pagination) {
        setPagination({
          currentPage: res.pagination.current_page,
          perPage: res.pagination.per_page,
          total: res.pagination.total,
          totalPages: res.pagination.total_pages
        })
      }
    } catch (error) {
      console.error('Failed to load invitations:', error)
      toast.error('Không thể tải danh sách thiệp mời')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
  if (page < 1 || page > pagination.totalPages) return

  setFilters({
    ...filters,
    page: page
  })
}

const currentPage = pagination.currentPage

const pageNumbers = Array.from(
  { length: pagination.totalPages },
  (_, i) => i + 1
)

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedInvitations(invitations.map(inv => inv.id))
    } else {
      setSelectedInvitations([])
    }
  }

  const handleSelectInvitation = (id, checked) => {
    if (checked) {
      setSelectedInvitations([...selectedInvitations, id])
    } else {
      setSelectedInvitations(selectedInvitations.filter(invId => invId !== id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedInvitations.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một thiệp mời')
      return
    }

    try {
      switch (action) {
        case 'publish':
          await Promise.all(selectedInvitations.map(id =>
            adminService.updateInvitationStatus(id, 'published')
          ))
          toast.success(`Đã xuất bản ${selectedInvitations.length} thiệp mời`)
          break
        case 'draft':
          await Promise.all(selectedInvitations.map(id =>
            adminService.updateInvitationStatus(id, 'draft')
          ))
          toast.success(`Đã chuyển ${selectedInvitations.length} thiệp mời về nháp`)
          break
        case 'archive':
          await Promise.all(selectedInvitations.map(id =>
            adminService.updateInvitationStatus(id, 'archived')
          ))
          toast.success(`Đã lưu trữ ${selectedInvitations.length} thiệp mời`)
          break
        case 'delete':
          if (window.confirm(`Bạn có chắc muốn xóa ${selectedInvitations.length} thiệp mời?`)) {
            await Promise.all(selectedInvitations.map(id =>
              adminService.deleteInvitation(id)
            ))
            toast.success(`Đã xóa ${selectedInvitations.length} thiệp mời`)
          }
          break
      }
      setSelectedInvitations([])
      loadInvitations()
    } catch (error) {
      console.error('Bulk action failed:', error)
      toast.error('Có lỗi xảy ra khi thực hiện hành động')
    }
  }

  const handleDeleteInvitation = async () => {
    if (!invitationToDelete) return

    try {
      await adminService.deleteInvitation(invitationToDelete.id)
      toast.success('Đã xóa thiệp mời thành công')
      setShowDeleteModal(false)
      setInvitationToDelete(null)
      loadInvitations()
    } catch (error) {
      console.error('Failed to delete invitation:', error)
      toast.error('Không thể xóa thiệp mời')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Nháp', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
      published: { text: 'Đã xuất bản', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      archived: { text: 'Lưu trữ', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    }
    const badge = badges[status] || badges.draft
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${badge.color}`}>
        {badge.text}
      </span>
    )
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

  return (
    <DashboardLayout>
      {/* <div className="space-y-4">
        <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Quản lý thiệp mời</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý tất cả thiệp mời trong hệ thống</p>
          </div>
          <button
            onClick={() => navigate('/collection')}
            className="w-full md:w-auto px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
          >
            <span className="material-symbols-outlined">add</span> Tạo Mới
          </button>
        </div> */}
       <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý thiệp mời</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quản lý tất cả thiệp mời trong hệ thống</p>
          </div>
          <button
            onClick={() => navigate('/collection')}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Tạo Thiệp Mới
          </button>
        </div>


        {/* Filters - Stacked Card Style for Mobile */}
        <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
            {isAdmin && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-2 pt-1 mb-1">
                  👤 Người dùng
                </label>
                <select
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  className="w-full px-2 py-1.5 bg-transparent text-gray-900 dark:text-white font-medium border-none outline-none focus:ring-0 text-sm"
                >
                  <option value="all">Tất cả người dùng</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.invitation_count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-2 pt-1 mb-1">
                Trạng thái
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2 py-1.5 bg-transparent text-gray-900 dark:text-white font-medium border-none outline-none focus:ring-0 text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-2 pt-1 mb-1">
                Sắp xếp theo
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-2 py-1.5 bg-transparent text-gray-900 dark:text-white font-medium border-none outline-none focus:ring-0 text-sm"
              >
                <option value="created_at">Ngày tạo</option>
                <option value="updated_at">Ngày cập nhật</option>
                <option value="title">Tên thiệp</option>
              </select>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-2 pt-1 mb-1">
                Thứ tự
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                className="w-full px-2 py-1.5 bg-transparent text-gray-900 dark:text-white font-medium border-none outline-none focus:ring-0 text-sm"
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-2 pt-1 mb-1">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-2 py-1.5 bg-transparent text-gray-900 dark:text-white font-medium border-none outline-none focus:ring-0 text-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedInvitations.length > 0 && (
          <div className="sticky top-[72px] z-20 bg-blue-50 dark:bg-blue-900/20 p-4 border-l-4 border-blue-600 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-bold text-blue-800 dark:text-blue-300">
                Đã chọn {selectedInvitations.length} thiệp mời
              </span>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleBulkAction('publish')} className="px-3 py-1.5 rounded bg-white shadow text-xs font-bold text-green-700 uppercase hover:bg-green-50">Xuất bản</button>
                <button onClick={() => handleBulkAction('draft')} className="px-3 py-1.5 rounded bg-white shadow text-xs font-bold text-yellow-700 uppercase hover:bg-yellow-50">Về nháp</button>
                <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 rounded bg-red-600 shadow text-xs font-bold text-white uppercase hover:bg-red-700">Xóa</button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white mb-4"></div>
              <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                {invitations.length === 0 ? (
                  <div className="p-16 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4 block">inbox</span>
                    <p className="font-bold text-gray-900 dark:text-white mb-2">Chưa có thiệp mời nào</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Bắt đầu tạo thiệp mời đầu tiên của bạn</p>
                    <button
                      onClick={() => navigate('/collection')}
                      className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-wider hover:bg-black dark:hover:bg-gray-100 transition-colors"
                    >
                      Tạo thiệp mới
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left w-4">
                          <input
                            type="checkbox"
                            checked={selectedInvitations.length === invitations.length && invitations.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin thiệp</th>
                        {isAdmin && (
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {invitations.map((invitation) => (
                        <tr key={invitation.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedInvitations.includes(invitation.id)}
                              onChange={(e) => handleSelectInvitation(invitation.id, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-9 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden shadow-sm flex-shrink-0">
                                {invitation.template_thumbnail ? (
                                  <img src={invitation.template_thumbnail} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <span className="material-symbols-outlined text-sm">image</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{invitation.title || 'Chưa đặt tên'}</p>
                                <p className="text-xs text-gray-500">{invitation.groom_name || 'Chưa đặt tên'} & {invitation.bride_name || 'Chưa đặt tên'}</p>
                              </div>
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                                  {invitation.user_name?.charAt(0)}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">{invitation.user_name || 'Chưa đặt tên'}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">{getStatusBadge(invitation.status)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(invitation.created_at)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => navigate(`/ultimate-html-editor?invitationId=${invitation.id}`)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" title="Sửa">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-lg">edit</span>
                              </button>
                              {invitation.status === 'published' && (
                                <button onClick={() => window.open(`/invitation/${invitation.slug}`, '_blank')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" title="Xem">
                                  <span className="material-symbols-outlined text-blue-600 text-lg">visibility</span>
                                </button>
                              )}
                              <button onClick={() => { setInvitationToDelete(invitation); setShowDeleteModal(true); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full" title="Xóa">
                                <span className="material-symbols-outlined text-red-600 text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* MOBILE LIST VIEW (Cards) */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="p-3 relative active:bg-gray-50 dark:active:bg-gray-900/50 transition-colors">
                      <div className="flex gap-3">
                        {/* Thumbnail/Icon */}
                        <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-700">
                          {invitation.template_thumbnail ? (
                            <img src={invitation.template_thumbnail} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                              <span className="material-symbols-outlined text-2xl">draft</span>
                              <span className="text-[9px] uppercase font-bold">No Img</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm">{invitation.title || 'Chưa đặt tên'}</h3>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                // Show mobile options menu logic here if needed
                              }}>
                                <span className="material-symbols-outlined text-gray-400 text-lg">more_horiz</span>
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 truncate">
                              {invitation.groom_name} & {invitation.bride_name}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(invitation.status)}
                              <span className="text-[10px] text-gray-400">• {new Date(invitation.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-auto">
                            <button
                              onClick={() => navigate(`/ultimate-html-editor?invitationId=${invitation.id}`)}
                              className="flex-1 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase rounded"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => { setInvitationToDelete(invitation); setShowDeleteModal(true); }}
                              className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 rounded border border-red-100"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {invitations.length === 0 && (
                    <div className="p-10 text-center">
                      <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">inbox</span>
                      <p className="font-medium text-gray-500">Chưa có thiệp mời nào</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    {invitations.length > 0 && (
  <div className="mt-6 flex items-center justify-center gap-2">
    <button
      onClick={() => handlePageChange(pagination.currentPage - 1)}
      disabled={loading || pagination.currentPage <= 1}
      className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40"
    >
      Trước
    </button>

    {pageNumbers.map((page) => (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        className={`px-3 py-1.5 text-sm rounded-md border ${
          page === pagination.currentPage
            ? 'bg-gray-900 text-white dark:bg-white dark:text-black border-gray-900 dark:border-white'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() => handlePageChange(pagination.currentPage + 1)}
      disabled={loading || pagination.currentPage >= pagination.totalPages}
      className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40"
    >
      Sau
    </button>
  </div>
)}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 max-w-sm w-full shadow-2xl rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Xóa thiệp mời này?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Hành động này không thể hoàn tác. Dữ liệu sẽ bị mất vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setInvitationToDelete(null)
                }}
                className="flex-1 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteInvitation}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default DashboardInvitationsPage
