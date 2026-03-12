import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import authService from '../services/auth.service'

export const ProfileContent = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const fileInputRef = useRef(null)
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.hiweb.vn'
  const PROFILE_ENDPOINT = `${API_BASE}/api/v1/user/profile`

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
    const profile = profileData || user || {}
    return (
      profile.full_name ||
      profile.name ||
      profile.user_name ||
      profile.email ||
      'Tài khoản'
    )
  }, [profileData, user])

  const personalRows = useMemo(() => {
    if (!profileData) return []
    const rows = [
      { label: 'Họ và tên', value: profileData.full_name },
      { label: 'Tên đăng nhập', value: profileData.user_name },
      { label: 'Email', value: profileData.email },
      { label: 'Số điện thoại', value: profileData.phone_number },
    ]
    return rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
  }, [profileData])

  const workRows = useMemo(() => {
    if (!profileData) return []
    const rows = [
      { label: 'Phòng ban', value: profileData.department_name_vi || profileData.department_name_en },
      { label: 'Khối', value: profileData.block_name_vi || profileData.block_name_en },
      { label: 'Trạng thái công việc', value: profileData.employment_status },
      { label: 'Ngày chính thức', value: profileData.official_date }
    ]
    return rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
  }, [profileData])

  const validateProfileForm = () => {
    if (!profileData) return false
    const errors = {}

    if (!profileData.first_name) {
      errors.first_name = 'Vui lòng nhập tên.'
    }
    if (!profileData.last_name) {
      errors.last_name = 'Vui lòng nhập họ.'
    }
    if (!profileData.email) {
      errors.email = 'Vui lòng nhập email.'
    }
    if (!profileData.phone_number) {
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

  const uploadAvatarToS3 = async (file, uploadUrl) => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
      body: file,
    })
    if (!response.ok) {
      throw new Error('Upload failed')
    }
  }

  const confirmUpload = async (fileKey, token) => {
    const response = await fetch(`${API_BASE}/system/confirmUpload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
      body: JSON.stringify({ file_key: fileKey }),
    })
    const data = await response.json()
    if (!data.status) {
      throw new Error(data.msg || 'Xác nhận upload thất bại')
    }
    return data.data?.final_url
  }

  const getPresignedUrl = async (file, token) => {
    const ext = file.type.split('/')[1] || 'jpg'
    const response = await fetch(`${API_BASE}/system/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
      body: JSON.stringify({
        size: file.size,
        ext,
        folder: 'Profile',
      }),
    })
    const data = await response.json()
    if (!data.status) {
      throw new Error(data.msg || 'Không thể lấy link upload')
    }
    return data.data
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    if (!profileData) return
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
      let finalAvatarUrl = profileData.avatar_url

      if (pendingFile) {
        try {
          const presignedData = await getPresignedUrl(pendingFile, token)
          const { upload_url, file_key, final_url } = presignedData
          await uploadAvatarToS3(pendingFile, upload_url)
          const confirmedFinalUrl = await confirmUpload(file_key, token)
          finalAvatarUrl = confirmedFinalUrl || final_url
        } catch (uploadError) {
          toast.error(uploadError.message || 'Upload ảnh thất bại.')
          setIsSubmitting(false)
          return
        }
      } else if (profileData.avatar_url === null || profileData.avatar_url === '') {
        finalAvatarUrl = '/assets/images/avatar-default.png'
      }

      const payload = {
        uuid: profileData.uuid,
        user_name: profileData.user_name,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        phone_number: profileData.phone_number,
        email: profileData.email,
        avatar_url: finalAvatarUrl,
        is_active: profileData.is_active,
        is_verified: profileData.is_verified,
        '2fa': profileData['2fa'] ?? profileData.twofa,
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

      const updatedProfile = { ...profileData, ...payload }
      localStorage.setItem('currentUser', JSON.stringify(updatedProfile))
      setProfileData(updatedProfile)
      setPendingFile(null)

      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar)
        setPreviewAvatar(null)
      }

      toast.success('Cập nhật hồ sơ thành công.')
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

  const handleChangePassword = async () => {
    if (!profileData?.email) {
      toast.warning('Chưa có email để đổi mật khẩu.')
      return
    }
    try {
      setChangingPassword(true)
      await authService.forgotPassword(profileData.email)
      toast.success('Đã gửi email đặt lại mật khẩu.')
    } catch (err) {
      toast.error('Không thể gửi email đặt lại mật khẩu.')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <p className="text-red-600 font-semibold mb-2">Không thể tải hồ sơ</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  const profile = profileData || user || {}

  return (
    <form onSubmit={handleUpdateProfile} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changingPassword ? 'Đang gửi...' : 'Đổi mật khẩu'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
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
              {profile.is_active === false ? 'Tạm khóa' : 'Đang hoạt động'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Thông tin cá nhân</h2>
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

    </form>
  )
}

const ProfilePage = () => {
  return (
    <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 md:px-8 pt-8 pb-20">
        <ProfileContent />
      </main>
      <Footer />
    </div>
  )
}

export default ProfilePage
