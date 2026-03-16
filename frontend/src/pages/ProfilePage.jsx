import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import authService from '../services/auth.service'
import mediaService from '../services/media.service'

export const ProfileContent = ({ variant = 'page' } = {}) => {
  const { user } = useAuth()
  const toast = useToast()
  const isDashboard = variant === 'dashboard'
  const [profileData, setProfileData] = useState(null)
  const [editData, setEditData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const fileInputRef = useRef(null)
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.hiweb.vn'
  const PROFILE_ENDPOINT = `${API_BASE}/api/v1/user/profile`
  const CHANGE_PASSWORD_ENDPOINT = `${API_BASE}/api/v1/user/change-password`

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await authService.getCurrentUser()
        if (!isMounted) return
        const data = response?.data || response?.user || response?.profile || null
        setProfileData(data)
        setEditData(data)
      } catch (err) {
        if (!isMounted) return
        setError(err?.message || 'Không thể tải hồ sơ')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar)
      }
    }
  }, [previewAvatar])

  const displayName = useMemo(() => {
    const profile = (isEditing ? editData : profileData) || user || {}
    return (
      profile.full_name ||
      profile.name ||
      profile.user_name ||
      profile.email ||
      'Tài khoản'
    )
  }, [editData, isEditing, profileData, user])

  const personalRows = useMemo(() => {
    const source = isEditing ? editData : profileData
    if (!source) return []
    const rows = [
      { label: 'Họ', value: source.last_name },
      { label: 'Tên', value: source.first_name },
      { label: 'Tên đăng nhập', value: source.user_name },
      { label: 'Email', value: source.email },
      { label: 'Số điện thoại', value: source.phone_number },
      {
        label: 'Xác minh',
        value: source.is_verified ? 'Đã xác minh' : 'Chưa xác minh',
      },
      {
        label: 'Bảo mật 2FA',
        value: (source['2fa'] ?? source.twofa) ? 'Đang bật' : 'Đang tắt',
      },
    ]
    return rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
  }, [editData, isEditing, profileData])

  const workRows = useMemo(() => {
    const source = isEditing ? editData : profileData
    if (!source) return []
    const rows = [
      { label: 'Phòng ban', value: source.department_name_vi || source.department_name_en },
      { label: 'Khối', value: source.block_name_vi || source.block_name_en },
      { label: 'Trạng thái công việc', value: source.employment_status },
      { label: 'Ngày chính thức', value: source.official_date }
    ]
    return rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
  }, [editData, isEditing, profileData])

  const validateProfileForm = () => {
    if (!editData) return false
    const errors = {}

    if (!editData.first_name) {
      errors.first_name = 'Vui lòng nhập tên.'
    }
    if (!editData.last_name) {
      errors.last_name = 'Vui lòng nhập họ.'
    }
    if (!editData.email) {
      errors.email = 'Vui lòng nhập email.'
    }
    if (!editData.phone_number) {
      errors.phone_number = 'Vui lòng nhập số điện thoại.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resizeImage = (file, maxWidth = 512, maxHeight = 512, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target.result
      }

      reader.onerror = reject
      reader.readAsDataURL(file)

      img.onload = () => {
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Resize failed'))
              return
            }
            const resizedFile = new File([blob], file.name, {
              type: blob.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          },
          file.type || 'image/jpeg',
          quality
        )
      }

      img.onerror = reject
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar)
      }
      setPendingFile(null)
      setPreviewAvatar(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ.')
      return
    }

    try {
      const resizedFile = await resizeImage(file, 512, 512, 0.8)
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar)
      }
      setPendingFile(resizedFile)
      setPreviewAvatar(URL.createObjectURL(resizedFile))
    } catch (err) {
      toast.error('Không thể xử lý ảnh, vui lòng thử lại.')
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    if (!editData) return
    if (!validateProfileForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin.')
      return
    }

    if (!window.confirm('Bạn có chắc muốn lưu thay đổi?')) {
      return
    }
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('userToken')
      let finalAvatarUrl = editData.avatar_url

      if (pendingFile) {
        try {
          const uploaded = await mediaService.upload(pendingFile)
          finalAvatarUrl = uploaded?.final_url || uploaded?.url || finalAvatarUrl
        } catch (uploadError) {
          toast.error(uploadError.message || 'Upload ảnh thất bại.')
          setIsSubmitting(false)
          return
        }
      } else if (editData.avatar_url === null || editData.avatar_url === '') {
        finalAvatarUrl = '/assets/images/avatar-default.png'
      }

      const payload = {
        uuid: editData.uuid,
        user_name: editData.user_name,
        first_name: editData.first_name,
        last_name: editData.last_name,
        full_name: `${editData.first_name || ''} ${editData.last_name || ''}`.trim(),
        phone_number: editData.phone_number,
        email: editData.email,
        avatar_url: finalAvatarUrl,
        is_active: editData.is_active,
        is_verified: editData.is_verified,
        '2fa': editData['2fa'] ?? editData.twofa,
      }

      const response = await fetch(PROFILE_ENDPOINT, {
        method: 'PUT',
        headers: {
          Authorization: token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const err = new Error(data.msg || 'Cập nhật hồ sơ thất bại')
        err.raw = data
        throw err
      }

      const updatedProfile = { ...editData, ...payload }
      localStorage.setItem('currentUser', JSON.stringify(updatedProfile))
      setProfileData(updatedProfile)
      setEditData(updatedProfile)
      setPendingFile(null)

      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar)
        setPreviewAvatar(null)
      }

      toast.success('Cập nhật hồ sơ thành công.')
      setIsEditing(false)
      window.dispatchEvent(
        new CustomEvent('profile-updated', {
          detail: { profile: updatedProfile },
        })
      )
    } catch (err) {
      const raw = err?.raw || {}
      const rawMsg = raw?.msg || ''
      const rawValue = raw?.err || ''

      if (rawMsg === 'already.exists') {
        if (rawValue.includes('@')) {
          toast.error('Email đã tồn tại.')
        } else if (/^[\d+\-\s()]+$/.test(rawValue)) {
          toast.error('Số điện thoại đã tồn tại.')
        } else {
          toast.error('Dữ liệu đã tồn tại.')
        }
      } else if (String(rawMsg).toLowerCase().includes('email') && String(rawMsg).toLowerCase().includes('exist')) {
        toast.error('Email đã tồn tại.')
      } else if (String(rawMsg).toLowerCase().includes('phone') && String(rawMsg).toLowerCase().includes('exist')) {
        toast.error('Số điện thoại đã tồn tại.')
      } else {
        toast.error(err?.message || 'Cập nhật hồ sơ thất bại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleCancelEdit = () => {
    setEditData(profileData)
    setFormErrors({})
    setPendingFile(null)
    if (previewAvatar) {
      URL.revokeObjectURL(previewAvatar)
      setPreviewAvatar(null)
    }
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    setPasswordErrors({})
    setPasswordForm({ current: '', next: '', confirm: '' })
    setPasswordModalOpen(true)
  }

  const validatePasswordForm = () => {
    const errors = {}

    if (!passwordForm.current) {
      errors.current = 'Vui lòng nhập mật khẩu hiện tại.'
    }
    if (!passwordForm.next) {
      errors.next = 'Vui lòng nhập mật khẩu mới.'
    } else if (passwordForm.next.length < 8) {
      errors.next = 'Mật khẩu tối thiểu 8 ký tự.'
    } else if (passwordForm.current && passwordForm.next === passwordForm.current) {
      errors.next = 'Mật khẩu mới phải khác mật khẩu cũ.'
    }
    if (!passwordForm.confirm) {
      errors.confirm = 'Vui lòng nhập lại mật khẩu mới.'
    } else if (passwordForm.confirm !== passwordForm.next) {
      errors.confirm = 'Mật khẩu nhập lại không khớp.'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitPasswordChange = async () => {
    if (!validatePasswordForm()) return

    try {
      setChangingPassword(true)
      const token = localStorage.getItem('userToken')
      const response = await fetch(CHANGE_PASSWORD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          old_password: passwordForm.current,
          new_password: passwordForm.next,
          password_confirmation: passwordForm.confirm,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || data?.status === false) {
        throw new Error(data?.message || data?.msg || 'Đổi mật khẩu thất bại.')
      }

      toast.success(data?.message || 'Đổi mật khẩu thành công.')
      setPasswordModalOpen(false)
      setPasswordErrors({})
      setPasswordForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err?.message || 'Không thể đổi mật khẩu.')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className={isDashboard ? 'w-full' : 'max-w-2xl mx-auto'}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={isDashboard ? 'w-full' : 'max-w-2xl mx-auto'}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <p className="text-red-600 font-semibold mb-2">Không thể tải hồ sơ</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  const profile = (isEditing ? editData : profileData) || user || {}

  return (
    <form
      onSubmit={handleUpdateProfile}
      className={isDashboard ? 'w-full space-y-6' : 'max-w-2xl mx-auto space-y-6'}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl font-bold">
            <img
              src={previewAvatar || profile.avatar_url || '/assets/images/avatar-default.png'}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/images/avatar-default.png'
              }}
            />
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center shadow-sm"
                  title="Đổi ảnh"
                  aria-label="Đổi ảnh"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Hồ sơ</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{displayName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile.user_name || profile.email || 'Thông tin tài khoản'}
            </p>
          </div>
          {/* {isAdmin && (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Chuyển qua Dashboard
            </button>
          )} */}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-xs text-gray-500">Đăng nhập gần nhất</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {profile.last_login_at || 'Chưa có dữ liệu'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-xs text-gray-500">Trạng thái</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {profile.is_active === false
                ? 'Tạm khóa'
                : profile.is_verified === false
                  ? 'Chưa xác minh'
                  : 'Đang hoạt động'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Thông tin cá nhân</h2>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Họ</label>
                <input
                  type="text"
                  value={editData?.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {formErrors.last_name && <p className="text-xs text-red-600 mt-1">{formErrors.last_name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Tên</label>
                <input
                  type="text"
                  value={editData?.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {formErrors.first_name && <p className="text-xs text-red-600 mt-1">{formErrors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={editData?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={editData?.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {formErrors.phone_number && <p className="text-xs text-red-600 mt-1">{formErrors.phone_number}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {personalRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right break-all">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Thông tin công việc</h2>
          {workRows.length > 0 ? (
            <div className="space-y-3">
              {workRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right break-all">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có thông tin công việc.</p>
          )}
        </div>
      </div>

      <div className={isDashboard ? 'mt-1' : 'fixed bottom-20 md:bottom-4 left-0 right-0 z-20 px-4'}>
        <div className={isDashboard ? 'w-full' : 'max-w-2xl mx-auto'}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl p-3 flex items-center justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Cập nhật
              </button>
            )}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? 'Đang gửi...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Đổi mật khẩu"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => setPasswordModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={changingPassword}
              className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmitPasswordChange}
            >
              {changingPassword ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitPasswordChange() } }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            {passwordErrors.current && <p className="text-xs text-red-600 mt-1">{passwordErrors.current}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={passwordForm.next}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitPasswordChange() } }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            {passwordErrors.next && <p className="text-xs text-red-600 mt-1">{passwordErrors.next}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitPasswordChange() } }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            {passwordErrors.confirm && <p className="text-xs text-red-600 mt-1">{passwordErrors.confirm}</p>}
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 space-y-1">
            <div className={passwordForm.next.length >= 8 ? 'text-green-600' : 'text-gray-600'}>• Tối thiểu 8 ký tự</div>
            <div className={passwordForm.next && passwordForm.confirm && passwordForm.next === passwordForm.confirm ? 'text-green-600' : 'text-gray-600'}>• Mật khẩu mới trùng khớp</div>
          </div>
        </div>
      </Modal>
    </form>
  )
}

const ProfilePage = () => {
  return (
    <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 md:px-8 pt-2 pb-16">
        <ProfileContent />
      </main>
      <Footer />
    </div>
  )
}

export default ProfilePage
