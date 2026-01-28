import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'

const PublishModal = ({ invitation, onClose, onPublish }) => {
  const toast = useToast()
  const [formData, setFormData] = useState({
    groomName: '',
    brideName: '',
    slug: '',
    visibility: 'public',
    password: ''
  })
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    if (invitation) {
      // Generate slug from names
      const groom = invitation.groom_name || ''
      const bride = invitation.bride_name || ''
      const autoSlug = generateSlug(groom, bride)
      
      setFormData({
        groomName: groom,
        brideName: bride,
        slug: invitation.slug || autoSlug,
        visibility: invitation.visibility || 'public',
        password: ''
      })
    }
  }, [invitation])

  const generateSlug = (groom, bride) => {
    const groomSlug = groom.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const brideSlug = bride.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `${groomSlug}-${brideSlug}`.replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-generate slug when names change
      if (field === 'groomName' || field === 'brideName') {
        updated.slug = generateSlug(
          field === 'groomName' ? value : prev.groomName,
          field === 'brideName' ? value : prev.brideName
        )
      }
      return updated
    })
  }

  const getPublicUrl = () => {
    if (!formData.slug) return ''
    // Format: https://groom-bride.yourdomain.com
    return `https://${formData.slug}.yourdomain.com`
  }

  const handlePublish = async () => {
    if (!formData.groomName || !formData.brideName) {
      toast.warning('⚠️ Vui lòng nhập tên chú rể và cô dâu!')
      return
    }

    if (!formData.slug) {
      toast.warning('⚠️ Vui lòng nhập slug!')
      return
    }

    if (formData.visibility === 'password' && !formData.password) {
      toast.warning('⚠️ Vui lòng nhập mật khẩu!')
      return
    }

    try {
      setIsPublishing(true)
      await onPublish({
        groom_name: formData.groomName,
        bride_name: formData.brideName,
        slug: formData.slug,
        visibility: formData.visibility,
        password: formData.visibility === 'password' ? formData.password : null
      })
      toast.success('🎉 Đã xuất bản thiệp mời thành công!')
      onClose()
    } catch (error) {
      toast.error(`❌ Không thể xuất bản: ${error.message}`)
    } finally {
      setIsPublishing(false)
    }
  }

  const copyUrl = () => {
    const url = getPublicUrl()
    navigator.clipboard.writeText(url)
    toast.success('📋 Đã sao chép URL!')
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-pink-500 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Xuất Bản Thiệp Mời</h2>
              <p className="text-white/80 text-sm">Tạo trang web riêng cho thiệp cưới của bạn</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Names Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">favorite</span>
              Thông Tin Cặp Đôi
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên Chú Rể *
                </label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => handleNameChange('groomName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên Cô Dâu *
                </label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => handleNameChange('brideName', e.target.value)}
                  placeholder="Trần Thị B"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* URL Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">link</span>
              Địa Chỉ Trang Web
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subdomain (Tự động tạo từ tên)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">https://</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="groom-bride"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <span className="text-gray-500 dark:text-gray-400 text-sm">.yourdomain.com</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Chỉ sử dụng chữ cái thường, số và dấu gạch ngang
              </p>
            </div>

            {/* Preview URL */}
            {formData.slug && (
              <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 dark:from-primary/20 dark:to-pink-500/20 rounded-xl p-4 border-2 border-primary/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">URL công khai của bạn:</p>
                    <p className="text-sm font-mono font-bold text-primary truncate">
                      {getPublicUrl()}
                    </p>
                  </div>
                  <button
                    onClick={copyUrl}
                    className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-primary font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    Sao chép
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lock</span>
              Quyền Riêng Tư
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                  className="w-5 h-5 text-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Công khai</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ai cũng có thể xem thiệp mời</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                  className="w-5 h-5 text-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Riêng tư</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chỉ người có link mới xem được</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="password"
                  checked={formData.visibility === 'password'}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                  className="w-5 h-5 text-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Bảo vệ bằng mật khẩu</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Yêu cầu mật khẩu để xem</p>
                </div>
              </label>

              {formData.visibility === 'password' && (
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 p-6 rounded-b-3xl border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || !formData.groomName || !formData.brideName || !formData.slug}
            className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-pink-500 hover:from-primary-dark hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang xuất bản...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">publish</span>
                Xuất Bản Ngay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublishModal
