import { useState, useEffect } from 'react'
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
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    published: 0,
    archived: 0
  })

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      const response = await invitationService.getAll()
      const invitationsList = response.data || []
      
      console.log('📋 Invitations loaded:', invitationsList)
      console.log('🖼️ First invitation thumbnail:', invitationsList[0]?.template_thumbnail)
      
      setInvitations(invitationsList)
      
      // Calculate stats
      setStats({
        total: invitationsList.length,
        draft: invitationsList.filter(i => i.status === 'draft').length,
        published: invitationsList.filter(i => i.status === 'published').length,
        archived: invitationsList.filter(i => i.status === 'archived').length
      })
    } catch (error) {
      console.error('Failed to load invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (invitation) => {
    navigate(`/ultimate-html-editor?invitationId=${invitation.id}`)
  }

  const handleDelete = async (invitation) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thiệp "${invitation.title}"?`)) {
      return
    }

    try {
      await invitationService.delete(invitation.id)
      toast.success('✨ Đã xóa thiệp mời thành công!')
      loadInvitations() // Reload list
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('❌ Không thể xóa thiệp mời. Vui lòng thử lại!')
    }
  }

  const handleDuplicate = async (invitation) => {
    try {
      await invitationService.duplicate(invitation.id)
      toast.success('🎉 Đã sao chép thiệp mời thành công!')
      loadInvitations() // Reload list
    } catch (error) {
      console.error('Failed to duplicate:', error)
      toast.error('❌ Không thể sao chép thiệp mời. Vui lòng thử lại!')
    }
  }

  const handleViewPublic = (invitation) => {
    if (invitation.status === 'published' && invitation.slug) {
      window.open(`/invitation/${invitation.slug}`, '_blank')
      toast.info('🔗 Đang mở thiệp mời công khai...')
    } else {
      toast.warning('⚠️ Thiệp chưa được xuất bản!')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { 
        text: 'Nháp', 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        )
      },
      published: { 
        text: 'Đã xuất bản', 
        color: 'bg-gray-900 dark:bg-white text-white dark:text-black border border-gray-900 dark:border-white',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      },
      archived: { 
        text: 'Lưu trữ', 
        color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
      }
    }
    const badge = badges[status] || badges.draft
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase ${badge.color} shadow-sm`}>
        {badge.icon}
        {badge.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col min-w-0 px-4 lg:px-10 pt-24 pb-10 gap-8 overflow-y-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gray-100 dark:bg-gray-900 p-8 lg:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 mb-4">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Bảng điều khiển</span>
              </div>
              <h1 className="text-gray-900 dark:text-white text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Thiệp Mời Của Bạn
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Quản lý, chỉnh sửa và chia sẻ những khoảnh khắc đặc biệt
              </p>
            </div>
            <button
              onClick={() => navigate('/collection')}
              className="group px-8 py-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-bold shadow-xl transition-all duration-300 flex items-center gap-3 hover:scale-105 hover:shadow-2xl"
            >
              <svg className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Tạo Thiệp Mới</span>
            </button>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <div className="group relative bg-gray-50 dark:bg-gray-900 p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-7 h-7 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Tổng số thiệp</p>
              </div>
            </div>
          </div>

          {/* Draft */}
          <div className="group relative bg-gray-50 dark:bg-gray-900 p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-600 dark:bg-gray-400 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-7 h-7 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Đang soạn</p>
              </div>
            </div>
          </div>

          {/* Published */}
          <div className="group relative bg-gray-50 dark:bg-gray-900 p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-7 h-7 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.published}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Đã xuất bản</p>
              </div>
            </div>
          </div>

          {/* Archived */}
          <div className="group relative bg-gray-50 dark:bg-gray-900 p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-700 dark:bg-gray-300 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-7 h-7 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.archived}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Lưu trữ</p>
              </div>
            </div>
          </div>
        </section>

        {/* Invitations List */}
        <div className="flex flex-col gap-6 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Danh sách thiệp mời
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {invitations.length} thiệp
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 dark:border-white absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Đang tải...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="relative bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center overflow-hidden">
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Chưa có thiệp mời nào
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Bắt đầu hành trình tạo thiệp mời đầu tiên của bạn. Chọn từ hàng trăm mẫu thiệp đẹp mắt.
                </p>
                <button
                  onClick={() => navigate('/collection')}
                  className="group px-8 py-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 inline-flex items-center gap-3"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Chọn Template
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="group relative bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex flex-col sm:flex-row gap-5 p-6">
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-32 h-44 sm:h-44 overflow-hidden shrink-0 shadow-md bg-gray-100 dark:bg-gray-800 group-hover:scale-105 transition-transform duration-300">
                      {(invitation.template_thumbnail || invitation.thumbnail_url || invitation.thumbnail) ? (
                        <>
                          <img 
                            src={invitation.template_thumbnail || invitation.thumbnail_url || invitation.thumbnail} 
                            alt={invitation.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('❌ Image load failed:', e.target.src)
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                            onLoad={(e) => {
                              console.log('✅ Image loaded:', e.target.src)
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {/* Decorative corner */}
                      <div className="absolute top-2 right-2 w-8 h-8 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {invitation.title}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(invitation.status)}
                        </div>

                        {/* Couple Names */}
                        {(invitation.groom_name || invitation.bride_name) && (
                          <p className="text-base text-gray-700 dark:text-gray-300 mb-3 font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {invitation.groom_name} {invitation.groom_name && invitation.bride_name && '&'} {invitation.bride_name}
                          </p>
                        )}

                        {/* Dates */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatDate(invitation.updated_at)}</span>
                          </div>
                          {invitation.event_date && (
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(invitation.event_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(invitation)}
                          className="group/btn px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Chỉnh sửa</span>
                        </button>

                        {invitation.status === 'published' && (
                          <button
                            onClick={() => handleViewPublic(invitation)}
                            className="px-4 py-2.5 bg-gray-700 dark:bg-gray-300 hover:bg-gray-600 dark:hover:bg-gray-200 text-white dark:text-black font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Xem</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDuplicate(invitation)}
                          className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Sao chép</span>
                        </button>

                        <button
                          onClick={() => handleDelete(invitation)}
                          className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ManagementPage
