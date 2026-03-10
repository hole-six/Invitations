import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'

const DashboardAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 0,
      totalInvitations: 0,
      totalUsers: 0,
      conversionRate: 0
    },
    chartData: [
      { date: '2024-01-08', views: 8, invitations: 37, users: 5 },
      { date: '2024-01-09', views: 0, invitations: 0, users: 0 },
      { date: '2024-01-10', views: 0, invitations: 0, users: 0 },
      { date: '2024-01-11', views: 0, invitations: 0, users: 0 },
    ],
    topTemplates: [],
    userActivity: [
      { hour: '00:00', users: 29 },
      { hour: '01:00', users: 9 },
      { hour: '02:00', users: 7 },
      { hour: '03:00', users: 4 },
      { hour: '04:00', users: 3 },
      { hour: '05:00', users: 5 },
      { hour: '06:00', users: 18 },
      { hour: '07:00', users: 35 },
      { hour: '08:00', users: 60 },
      { hour: '09:00', users: 80 },
    ],
    revenueData: []
  })

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      setAnalytics({
        overview: {
          totalViews: 15420,
          totalInvitations: 1247,
          totalUsers: 892,
          conversionRate: 8.1
        },
        chartData: [
          { date: '2024-01-08', views: 120, invitations: 15, users: 8 },
          { date: '2024-01-09', views: 145, invitations: 18, users: 12 },
          { date: '2024-01-10', views: 180, invitations: 22, users: 15 },
          { date: '2024-01-11', views: 165, invitations: 19, users: 10 },
          { date: '2024-01-12', views: 200, invitations: 25, users: 18 },
          { date: '2024-01-13', views: 220, invitations: 28, users: 20 },
          { date: '2024-01-14', views: 195, invitations: 24, users: 16 }
        ],
        topTemplates: [
          { name: 'Luxury Gold Wedding', views: 2450, uses: 245, conversion: 10.0 },
          { name: 'Modern Minimalist', views: 1890, uses: 189, conversion: 10.0 },
          { name: 'Romantic Rose', views: 1560, uses: 156, conversion: 10.0 },
          { name: 'Classic Elegant', views: 1340, uses: 134, conversion: 10.0 },
          { name: 'Vintage Style', views: 980, uses: 98, conversion: 10.0 }
        ],
        userActivity: [
          { hour: '00:00', users: 12 },
          { hour: '01:00', users: 8 },
          { hour: '02:00', users: 5 },
          { hour: '03:00', users: 3 },
          { hour: '04:00', users: 2 },
          { hour: '05:00', users: 4 },
          { hour: '06:00', users: 15 },
          { hour: '07:00', users: 28 },
          { hour: '08:00', users: 45 },
          { hour: '09:00', users: 62 },
          { hour: '10:00', users: 78 },
          { hour: '11:00', users: 85 },
          { hour: '12:00', users: 92 },
          { hour: '13:00', users: 88 },
          { hour: '14:00', users: 95 },
          { hour: '15:00', users: 102 },
          { hour: '16:00', users: 98 },
          { hour: '17:00', users: 85 },
          { hour: '18:00', users: 72 },
          { hour: '19:00', users: 65 },
          { hour: '20:00', users: 58 },
          { hour: '21:00', users: 45 },
          { hour: '22:00', users: 32 },
          { hour: '23:00', users: 18 }
        ],
        revenueData: [
          { month: 'Jan', revenue: 12500, subscriptions: 45 },
          { month: 'Feb', revenue: 15200, subscriptions: 52 },
          { month: 'Mar', revenue: 18900, subscriptions: 68 },
          { month: 'Apr', revenue: 22100, subscriptions: 75 },
          { month: 'May', revenue: 19800, subscriptions: 71 },
          { month: 'Jun', revenue: 25400, subscriptions: 89 }
        ]
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, change, icon, color = 'gray', suffix = '' }) => (
    <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
              )}
              {Math.abs(change)}% so với kỳ trước
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/20`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const SimpleChart = ({ data, dataKey, color = '#374151' }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]))
    
    return (
      <div className="flex items-end gap-1 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-gray-900 dark:bg-white transition-all duration-300 hover:opacity-80"
              style={{ 
                height: `${(item[dataKey] / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-center">
              {item.date ? new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 
               item.hour ? item.hour.slice(0, 2) : 
               item.month || index}
            </span>
          </div>
        ))}
      </div>
    )
  }

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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thống kê & Báo cáo</h1>
            <p className="text-gray-600 dark:text-gray-400">Phân tích hiệu suất và xu hướng sử dụng</p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">90 ngày qua</option>
              <option value="1y">1 năm qua</option>
            </select>
            <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng lượt xem"
            value={analytics.overview.totalViews}
            change={12.5}
            color="blue"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <StatCard
            title="Thiệp mời được tạo"
            value={analytics.overview.totalInvitations}
            change={8.1}
            color="green"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
          />
          <StatCard
            title="Người dùng mới"
            value={analytics.overview.totalUsers}
            change={15.3}
            color="purple"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />
          <StatCard
            title="Tỷ lệ chuyển đổi"
            value={analytics.overview.conversionRate}
            change={2.4}
            suffix="%"
            color="orange"
            icon={
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lượt truy cập</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-900 dark:bg-white"></div>
                  <span className="text-gray-600 dark:text-gray-400">Lượt xem</span>
                </div>
              </div>
            </div>
            <SimpleChart data={analytics.chartData} dataKey="views" />
          </div>

          {/* User Activity Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hoạt động theo giờ</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-900 dark:bg-white"></div>
                  <span className="text-gray-600 dark:text-gray-400">Người dùng</span>
                </div>
              </div>
            </div>
            <SimpleChart data={analytics.userActivity.filter((_, i) => i % 2 === 0)} dataKey="users" />
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Templates */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Templates phổ biến nhất</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lượt xem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sử dụng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tỷ lệ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.topTemplates.map((template, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {template.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {template.uses.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {template.conversion}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Doanh thu theo tháng</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-900 dark:bg-white"></div>
                  <span className="text-gray-600 dark:text-gray-400">Doanh thu</span>
                </div>
              </div>
            </div>
            <SimpleChart data={analytics.revenueData} dataKey="revenue" />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$125K</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng doanh thu</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">400</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Đăng ký</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$312</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trung bình/tháng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phân tích chi tiết</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tăng trưởng</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Lượt truy cập tăng 25% so với tháng trước, cho thấy sự quan tâm ngày càng tăng của người dùng.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Doanh thu</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Doanh thu ổn định với xu hướng tăng trưởng tích cực, đặc biệt trong mùa cưới.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Người dùng</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Tỷ lệ người dùng quay lại cao (68%), cho thấy sự hài lòng với dịch vụ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardAnalyticsPage