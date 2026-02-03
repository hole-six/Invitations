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
    navigate(`/ultimate-html-editor?invitationId=${invitation.id}`)
  }

  const handleDelete = async (e, invitation) => {
    e.stopPropagation()
    if (!window.confirm(`Bạn có chắc muốn xóa thiệp "${invitation.title}"?`)) return

    try {
      await invitationService.delete(invitation.id)
      toast.success('✨ Đã xóa thiệp mời thành công!')
      loadInvitations()
    } catch (error) {
      toast.error('❌ Không thể xóa thiệp mời.')
    }
  }

  const handleDuplicate = async (e, invitation) => {
    e.stopPropagation()
    try {
      await invitationService.duplicate(invitation.id)
      toast.success('🎉 Đã sao chép thiệp mời!')
      loadInvitations()
    } catch (error) {
      toast.error('❌ Không thể sao chép thiệp.')
    }
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

      <main className="flex-1 flex flex-col min-w-0 px-4 md:px-8 pt-20 pb-20">

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
        <div className="sticky top-[70px] z-20 bg-gray-50/95 dark:bg-black/95 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 mb-8 border-b md:border-none border-gray-200 dark:border-gray-800 transition-all">
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
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <span className="material-symbols-outlined text-2xl md:text-4xl text-gray-300">image</span>
                    </div>
                  )}

                  {/* Status Badge - Desktop Only (On Image) */}
                  <div className="hidden md:block absolute top-3 left-3 px-2 py-1 rounded-md bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold uppercase shadow-sm">
                    {invitation.status === 'published' ? <span className="text-green-600">Published</span> : <span className="text-gray-500">Draft</span>}
                  </div>

                  {/* Three Dots - Desktop Position (Top Right of Image) */}
                  <button
                    onClick={(e) => toggleMenu(e, invitation.id)}
                    className="hidden md:flex absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur items-center justify-center hover:bg-white dark:hover:bg-black transition-colors shadow-sm z-10"
                  >
                    <span className="material-symbols-outlined text-base">more_vert</span>
                  </button>
                </div>

                {/* 2. CONTENT AREA */}
                <div className="p-3 md:p-5 flex-1 flex flex-col min-w-0 justify-center md:justify-start">
                  {/* Mobile Status Badge (Inline) */}
                  <div className="md:hidden flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase ${invitation.status === 'published' ? 'text-green-600' : 'text-gray-400'}`}>
                      {invitation.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    {/* Mobile Three Dots (Top Right of Content) */}
                    <button
                      onClick={(e) => toggleMenu(e, invitation.id)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 active:text-black"
                    >
                      <span className="material-symbols-outlined text-base">more_vert</span>
                    </button>
                  </div>

                  <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {invitation.title || 'Thiệp chưa đặt tên'}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mb-2 md:mb-4 font-mono truncate">
                    {new Date(invitation.updated_at).toLocaleDateString()}
                  </p>

                  <div className="mt-auto hidden md:flex gap-2">
                    <button
                      onClick={(e) => handleEdit(e, invitation)}
                      className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                    {invitation.status === 'published' && (
                      <button
                        onClick={(e) => handleViewPublic(e, invitation)}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                        title="Xem online"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. DROPDOWN MENU (Absolute) */}
                {openMenuId === invitation.id && (
                  <div className="absolute top-8 right-2 md:top-12 md:right-3 w-40 md:w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <button onClick={(e) => handleEdit(e, invitation)} className="md:hidden w-full px-4 py-3 text-left text-sm font-bold text-gray-900 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                      <span className="material-symbols-outlined text-purple-600">edit</span> Chỉnh sửa
                    </button>
                    <button onClick={(e) => handleDuplicate(e, invitation)} className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-500">content_copy</span> Sao chép
                    </button>
                    {invitation.status === 'published' && (
                      <button onClick={(e) => handleViewPublic(e, invitation)} className="md:hidden w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-500">visibility</span> Xem
                      </button>
                    )}
                    <button onClick={(e) => handleDelete(e, invitation)} className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2">
                      <span className="material-symbols-outlined">delete</span> Xóa thiệp
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default ManagementPage
