import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import authService from '../services/auth.service'
import { hasAdminAccess } from '../utils/permissions'

export const ProfileContent = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isAdmin = hasAdminAccess()

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
        setRoles(response?.roles || data?.roles || [])
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

  const initials = useMemo(() => {
    const name = displayName.trim()
    if (!name) return '?'
    const parts = name.split(' ').filter(Boolean)
    const first = parts[0]?.charAt(0) || ''
    const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : ''
    return `${first}${last}`.toUpperCase() || '?'
  }, [displayName])

  const roleLabels = useMemo(() => {
    if (!roles || !Array.isArray(roles)) return []
    return roles
      .map((role) => {
        if (typeof role === 'string') return role
        return role.name_vi || role.name_en || role.name || role.slug || role.role || ''
      })
      .filter(Boolean)
  }, [roles])

  const infoRows = useMemo(() => {
    if (!profileData) return []
    const rows = [
      { label: 'Họ và tên', value: profileData.full_name },
      { label: 'Tên đăng nhập', value: profileData.user_name },
      { label: 'Email', value: profileData.email },
      { label: 'Số điện thoại', value: profileData.phone_number },
      { label: 'Phòng ban', value: profileData.department_name_vi || profileData.department_name_en },
      { label: 'Đăng nhập gần nhất', value: profileData.last_login_at },
      { label: 'Trạng thái', value: profileData.is_active === false ? 'Tạm khóa' : 'Đang hoạt động' }
    ]
    return rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
  }, [profileData])

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
    <div className="max-w-full mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl font-bold">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Hồ sơ</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{displayName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile.user_name || profile.email || 'Thông tin tài khoản'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Chuyển qua Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Thông tin tài khoản</h2>
          <div className="space-y-3">
            {infoRows.map((row) => (
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
          <h2 className="text-lg font-bold mb-4">Vai trò</h2>
          {roleLabels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {roleLabels.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {role}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có vai trò nào.</p>
          )}
        </div>
      </div>

      {/* <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Quyền hạn</h2>
        {permissions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission) => (
              <span
                key={permission}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {permission}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có quyền nào.</p>
        )}
      </div> */}
    </div>
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
