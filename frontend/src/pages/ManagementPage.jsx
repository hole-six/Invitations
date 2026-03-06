import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import invitationService from '../services/invitation.service'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const ManagementPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  // Data State
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'draft', 'published', 'archived'
  const [openMenuId, setOpenMenuId] = useState(null) // For dropdown menus
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: '', // 'edit', 'copy', 'delete'
    invitation: null
  })

  useEffect(() => {
    loadInvitations()

    // Close menus when clicking outside
    const handleClickOutside = () => setOpenMenuId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      const response = await invitationService.getAll()
      setInvitations(response.data || [])
    } catch (error) {
      console.error('Failed to load invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  // LOGIC: Filter & Search
  const filteredInvitations = useMemo(() => {
    return invitations.filter(invitation => {
      // 1. Status Filter
      if (activeFilter !== 'all' && invitation.status !== activeFilter) return false

      // 2. Search Filter (Title, Groom, Bride)
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const titleMatch = invitation.title?.toLowerCase().includes(term)
        const groomMatch = invitation.groom_name?.toLowerCase().includes(term)
        const brideMatch = invitation.bride_name?.toLowerCase().includes(term)
        if (!titleMatch && !groomMatch && !brideMatch) return false
      }
      return true
    })
  }, [invitations, activeFilter, searchTerm])

  const stats = useMemo(() => ({
    total: invitations.length,
    draft: invitations.filter(i => i.status === 'draft').length,
    published: invitations.filter(i => i.status === 'published').length,
    archived: invitations.filter(i => i.status === 'archived').length
  }), [invitations])

  // ACTIONS
  const handleEdit = (e, invitation) => {
    e.stopPropagation()
    setConfirmDialog({
      show: true,
      type: 'edit',
      invitation
    })
  }

  const confirmEdit = () => {
    if (confirmDialog.invitation) {
      navigate(`/ultimate-html-editor?invitationId=${confirmDialog.invitation.id}`)
    }
    setConfirmDialog({ show: false, type: '', invitation: null })
  }

  const handleDelete = async (e, invitation) => {
    e.stopPropagation()
    setConfirmDialog({
      show: true,
      type: 'delete',
      invitation
    })
  }

  const confirmDelete = async () => {
    if (!confirmDialog.invitation) return

    try {
      // Use UUID for delete as per new API
      const deleteId = confirmDialog.invitation.uuid || confirmDialog.invitation.id
      await invitationService.delete(deleteId)
      toast.success('✨ Đã xóa thiệp mời thành công!')
      loadInvitations()
    } catch (error) {
      toast.error('❌ Không thể xóa thiệp mời.')
    }
    setConfirmDialog({ show: false, type: '', invitation: null })
  }

  const handleDuplicate = async (e, invitation) => {
    e.stopPropagation()
    setConfirmDialog({
      show: true,
      type: 'copy',
      invitation
    })
  }

  const confirmDuplicate = async () => {
    if (!confirmDialog.invitation) return

    try {
      await invitationService.duplicate(confirmDialog.invitation.id)
      toast.success('🎉 Đã sao chép thiệp mời!')
      loadInvitations()
    } catch (error) {
      toast.error('❌ Không thể sao chép thiệp.')
    }
    setConfirmDialog({ show: false, type: '', invitation: null })
  }

  const handleViewPublic = (e, invitation) => {
    e.stopPropagation()
    if (invitation.status === 'published' && invitation.slug) {
      window.open(`/invitation/${invitation.slug}`, '_blank')
    } else {
      toast.warning('⚠️ Thiệp chưa được xuất bản!')
    }
  }

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === id ? null : id)
  }

  return (
    <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col min-w-0 px-4 md:px-8 pt-8 pb-20">

        {/* HERO HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">QUẢN LÝ THIỆP</p>
            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-2">Dự Án Của Bạn</h1>
            <p className="text-gray-500 font-medium">{stats.total} thiệp mời đang chờ bạn sáng tạo.</p>
          </div>

          <button
            onClick={() => navigate('/collection')}
            className="w-full md:w-auto px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
          >
            <span className="material-symbols-outlined">add</span> Tạo Mới
          </button>
        </div>

        {/* TOOLBAR: Search & Filter */}
        <div className="sticky top-16 z-20 bg-gray-50/95 dark:bg-black/95 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 mb-8 border-b md:border-none border-gray-200 dark:border-gray-800 transition-all">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

            {/* Filter Tabs */}
            <div className="flex p-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm w-full md:w-auto overflow-x-auto hide-scrollbar">
              {['all', 'published', 'draft', 'archived'].map(status => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`
                      px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all
                      ${activeFilter === status
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}
                    `}
                >
                  {status === 'all' ? 'Tất cả' :
                    status === 'published' ? 'Đã xuất bản' :
                      status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors material-symbols-outlined">search</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm thiệp..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <span className="material-symbols-outlined text-6xl mb-4 text-gray-300">draft</span>
            <p className="text-xl font-bold">Không tìm thấy thiệp nào</p>
            <p className="text-sm">Hãy thử tìm từ khóa khác hoặc tạo thiệp mới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {filteredInvitations.map((invitation) => (
              <div
                key={invitation.id}
                onClick={(e) => handleEdit(e, invitation)}
                className="group relative bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-row md:flex-col h-32 md:h-auto"
              >
                {/* 1. THUMBNAIL AREA */}
                {/* Mobile: Width 32 (128px), Height Full. Desktop: Width Full, Aspect 4/3 */}
                <div className="relative w-32 md:w-full h-full md:h-auto md:aspect-[4/3] bg-gray-100 dark:bg-gray-800 shrink-0 border-r md:border-r-0 md:border-b border-gray-100 dark:border-gray-800">
                  {invitation.template_thumbnail ? (
                    <img
                      src={invitation.template_thumbnail}
                      className="w-full h-full object-cover"
                      alt={invitation.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <span className="material-symbols-outlined text-2xl md:text-4xl text-gray-300">image</span>
                    </div>
                  )}

                  {/* Status Badge - Desktop Only (On Image) */}
                  <div className="hidden md:block absolute top-3 left-3">
                    {invitation.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur text-white text-xs font-semibold shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-gray-700 text-xs font-semibold shadow-lg">
                        <span className="material-symbols-outlined text-[14px]">edit_note</span>
                        Bản nháp
                      </span>
                    )}
                  </div>

                  {/* Views Count - Desktop Only */}
                  {invitation.views_count > 0 && (
                    <div className="hidden md:flex absolute bottom-3 right-3 items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      {invitation.views_count}
                    </div>
                  )}

                  {/* Three Dots - Desktop Position (Top Right of Image) */}
                  <button
                    onClick={(e) => toggleMenu(e, invitation.id)}
                    className="hidden md:flex absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur items-center justify-center hover:bg-white dark:hover:bg-black transition-colors shadow-lg z-10"
                  >
                    <span className="material-symbols-outlined text-base">more_vert</span>
                  </button>
                </div>

                {/* 2. CONTENT AREA */}
                <div className="p-3 md:p-5 flex-1 flex flex-col min-w-0 justify-center md:justify-start">
                  {/* Mobile Status Badge (Inline) */}
                  <div className="md:hidden flex items-center justify-between mb-2">
                    {invitation.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-bold">
                        <span className="w-1 h-1 rounded-full bg-white"></span>
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold">
                        Nháp
                      </span>
                    )}
                    {/* Mobile Three Dots (Top Right of Content) */}
                    <button
                      onClick={(e) => toggleMenu(e, invitation.id)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 active:text-black dark:active:text-white"
                    >
                      <span className="material-symbols-outlined text-base">more_vert</span>
                    </button>
                  </div>

                  <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {invitation.title || 'Thiệp chưa đặt tên'}
                  </h3>

                  {/* Info Row */}
                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mb-2 md:mb-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] md:text-[14px]">calendar_today</span>
                      {new Date(invitation.updated_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </span>
                    {invitation.views_count > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] md:text-[14px]">visibility</span>
                          {invitation.views_count}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons - Desktop */}
                  <div className="mt-auto hidden md:flex gap-2">
                    <button
                      onClick={(e) => handleEdit(e, invitation)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-80 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, invitation)}
                      className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                      title="Sao chép"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                    {invitation.status === 'published' && (
                      <button
                        onClick={(e) => handleViewPublic(e, invitation)}
                        className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                        title="Xem thiệp"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. DROPDOWN MENU (Absolute) */}
                {openMenuId === invitation.id && (
                  <div className="absolute top-10 right-2 md:top-14 md:right-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <button
                      onClick={(e) => handleEdit(e, invitation)}
                      className="md:hidden w-full px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700"
                    >
                      <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">edit</span>
                      <span>Chỉnh sửa</span>
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, invitation)}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">content_copy</span>
                      <span>Sao chép thiệp</span>
                    </button>
                    {invitation.status === 'published' && (
                      <button
                        onClick={(e) => handleViewPublic(e, invitation)}
                        className="md:hidden w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700"
                      >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">visibility</span>
                        <span>Xem thiệp</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, invitation)}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">delete</span>
                      <span>Xóa thiệp</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            {/* Icon & Title */}
            <div className="p-6 text-center">
              <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${confirmDialog.type === 'delete'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : confirmDialog.type === 'copy'
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-orange-50 dark:bg-orange-900/20'
                }`}>
                {confirmDialog.type === 'delete' ? (
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : confirmDialog.type === 'copy' ? (
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {confirmDialog.type === 'delete' && 'Xác nhận xóa'}
                {confirmDialog.type === 'copy' && 'Xác nhận sao chép'}
                {confirmDialog.type === 'edit' && 'Xác nhận chỉnh sửa'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {confirmDialog.type === 'delete' && (
                  <>
                    Bạn có chắc chắn muốn xóa thiệp <span className="font-semibold">"{confirmDialog.invitation?.title}"</span>?<br />
                    <span className="text-red-600 dark:text-red-400 font-medium">Hành động này không thể hoàn tác!</span>
                  </>
                )}
                {confirmDialog.type === 'copy' && (
                  <>
                    Bạn có muốn sao chép thiệp <span className="font-semibold">"{confirmDialog.invitation?.title}"</span>?<br />
                    Một bản sao mới sẽ được tạo trong danh sách của bạn.
                  </>
                )}
                {confirmDialog.type === 'edit' && (
                  <>
                    Bạn có muốn chỉnh sửa thiệp <span className="font-semibold">"{confirmDialog.invitation?.title}"</span>?<br />
                    Bạn sẽ được chuyển đến trang chỉnh sửa.
                  </>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setConfirmDialog({ show: false, type: '', invitation: null })}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.type === 'delete') confirmDelete()
                  else if (confirmDialog.type === 'copy') confirmDuplicate()
                  else if (confirmDialog.type === 'edit') confirmEdit()
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${confirmDialog.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : confirmDialog.type === 'copy'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
              >
                {confirmDialog.type === 'delete' && 'Xóa'}
                {confirmDialog.type === 'copy' && 'Sao chép'}
                {confirmDialog.type === 'edit' && 'Chỉnh sửa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ManagementPage
