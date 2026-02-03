import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import adminService from '../services/admin.service'

const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalInvitations: 0,
    publishedInvitations: 0,
    draftInvitations: 0,
    totalTemplates: 0,
    totalUsers: 0,
    monthlyGrowth: 0
  })
  const [recentInvitations, setRecentInvitations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load dashboard stats from admin API
      const statsRes = await adminService.getDashboardStats()
      const statsData = statsRes.data || {}

      setStats({
        totalInvitations: statsData.totalInvitations || 0,
        publishedInvitations: statsData.publishedInvitations || 0,
        draftInvitations: statsData.draftInvitations || 0,
        totalTemplates: statsData.totalTemplates || 0,
        totalUsers: statsData.totalUsers || 0,
        monthlyGrowth: statsData.monthlyGrowth || 0
      })

      // Load recent invitations
      const invitationsRes = await adminService.getAllInvitations({ sortBy: 'created_at', sortOrder: 'desc' })
      const invitations = invitationsRes.data || []
      setRecentInvitations(invitations.slice(0, 5))

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, change, icon, color = 'gray' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )

  const ActivityItem = ({ title, description, time, type }) => (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        type === 'create' ? 'bg-green-100 dark:bg-green-900/20' :
        type === 'update' ? 'bg-blue-100 dark:bg-blue-900/20' :
        type === 'delete' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <div className={`w-2.5 h-2.5 rounded-full ${
          type === 'create' ? 'bg-green-500' :
          type === 'update' ? 'bg-blue-500' :
          type === 'delete' ? 'bg-red-500' : 'bg-gray-500'
        }`}></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{description}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{time}</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        {/* Hero Stats Section */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-white dark:via-gray-50 dark:to-gray-100 rounded-2xl p-8 text-white dark:text-gray-900 shadow-2xl">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Chào mừng trở lại, {user?.full_name || 'Admin'}
            </h1>
            <p className="text-white/80 dark:text-gray-600 text-lg mb-8">
              Tổng quan hoạt động hệ thống của bạn
            </p>
            
            {/* Inline Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{stats.totalInvitations}</div>
                <div className="text-white/70 dark:text-gray-600 text-sm">Tổng thiệp mời</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{stats.publishedInvitations}</div>
                <div className="text-white/70 dark:text-gray-600 text-sm">Đã xuất bản</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{stats.totalTemplates}</div>
                <div className="text-white/70 dark:text-gray-600 text-sm">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{stats.totalUsers}</div>
                <div className="text-white/70 dark:text-gray-600 text-sm">Người dùng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <StatCard
            title="Tổng số thiệp mời"
            value={stats.totalInvitations.toLocaleString()}
            change={15.2}
            color="blue"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Thiệp đã xuất bản"
            value={stats.publishedInvitations.toLocaleString()}
            change={8.1}
            color="green"
            icon={
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Templates"
            value={stats.totalTemplates.toLocaleString()}
            change={5.4}
            color="purple"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
            }
          />
          <StatCard
            title="Người dùng"
            value={stats.totalUsers.toLocaleString()}
            change={stats.monthlyGrowth}
            color="orange"
            icon={
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Left Column - Activity & Recent Invitations */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Hoạt động gần đây</h3>
              </div>
              <div className="p-4 space-y-1">
              <ActivityItem
                title="Thiệp mời mới được tạo"
                description="Wedding Invitation - Luxury Gold được tạo bởi Nguyễn Văn A"
                time="2 phút trước"
                type="create"
              />
              <ActivityItem
                title="Template được cập nhật"
                description="Template 'Modern Minimalist' đã được cập nhật"
                time="15 phút trước"
                type="update"
              />
              <ActivityItem
                title="Người dùng mới đăng ký"
                description="Trần Thị B đã đăng ký tài khoản"
                time="1 giờ trước"
                type="create"
              />
              <ActivityItem
                title="Thiệp mời được xuất bản"
                description="'Romantic Rose' đã được xuất bản"
                time="2 giờ trước"
                type="update"
              />
              <ActivityItem
                title="Template bị xóa"
                description="Template 'Old Design' đã bị xóa"
                time="3 giờ trước"
                type="delete"
              />
            </div>
          </div>

          {/* Recent Invitations - Moved here */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Thiệp mời gần đây</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">Xem tất cả →</button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentInvitations.slice(0, 5).map((invitation) => (
                <div key={invitation.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {invitation.title || 'Chưa đặt tên'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(invitation.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className={`ml-4 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      invitation.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {invitation.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Top Templates */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Templates phổ biến</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { name: 'Luxury Gold Wedding', uses: 245 },
                  { name: 'Modern Minimalist', uses: 189 },
                  { name: 'Romantic Rose', uses: 156 },
                  { name: 'Classic Elegant', uses: 134 }
                ].map((template, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{template.uses}</p>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 h-2.5 rounded-full transition-all"
                        style={{ width: `${(template.uses / 245) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Trạng thái hệ thống</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Server Status</span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">78%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Backup</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">2h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage