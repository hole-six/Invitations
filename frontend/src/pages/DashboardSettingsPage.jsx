import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../context/ToastContext'

const DashboardSettingsPage = () => {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Thiệp Cưới Online',
      siteDescription: 'Tạo thiệp cưới online đẹp và chuyên nghiệp',
      contactEmail: 'contact@thiepcuoi.com',
      supportEmail: 'support@thiepcuoi.com',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      maintenanceMode: false
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromEmail: 'noreply@thiepcuoi.com',
      fromName: 'Thiệp Cưới Online'
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChars: true,
      enableCaptcha: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'local',
      lastBackup: '2024-01-15T10:30:00Z'
    },
    notifications: {
      emailNotifications: true,
      newUserRegistration: true,
      newInvitationCreated: false,
      systemAlerts: true,
      maintenanceAlerts: true
    }
  })

  const tabs = [
    { id: 'general', name: 'Cài đặt chung', icon: '⚙️' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'security', name: 'Bảo mật', icon: '🔒' },
    { id: 'backup', name: 'Sao lưu', icon: '💾' },
    { id: 'notifications', name: 'Thông báo', icon: '🔔' }
  ]

  const handleSave = async (section) => {
    try {
      setLoading(true)
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Đã lưu cài đặt ${tabs.find(t => t.id === section)?.name}`)
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Không thể lưu cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleBackupNow = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSettings(prev => ({
        ...prev,
        backup: {
          ...prev.backup,
          lastBackup: new Date().toISOString()
        }
      }))
      toast.success('Sao lưu thành công')
    } catch (error) {
      console.error('Backup failed:', error)
      toast.error('Sao lưu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Email test đã được gửi thành công')
    } catch (error) {
      console.error('Email test failed:', error)
      toast.error('Không thể gửi email test')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
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

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tên website
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email liên hệ
          </label>
          <input
            type="email"
            value={settings.general.contactEmail}
            onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mô tả website
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Múi giờ
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          >
            <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">New York (UTC-5)</option>
            <option value="Europe/London">London (UTC+0)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ngôn ngữ
          </label>
          <select
            value={settings.general.language}
            onChange={(e) => updateSetting('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.general.maintenanceMode}
          onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
          className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
        />
        <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Chế độ bảo trì
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('general')}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={settings.email.smtpUsername}
            onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email gửi
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tên người gửi
          </label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mã hóa
        </label>
        <select
          value={settings.email.smtpEncryption}
          onChange={(e) => updateSetting('email', 'smtpEncryption', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
        >
          <option value="tls">TLS</option>
          <option value="ssl">SSL</option>
          <option value="none">Không</option>
        </select>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleTestEmail}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Test Email'}
        </button>
        <button
          onClick={() => handleSave('email')}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thời gian hết hạn phiên (phút)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Số lần đăng nhập tối đa
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Độ dài mật khẩu tối thiểu
        </label>
        <input
          type="number"
          value={settings.security.passwordMinLength}
          onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enableTwoFactor"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
            className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
          />
          <label htmlFor="enableTwoFactor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bật xác thực 2 yếu tố
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="requireSpecialChars"
            checked={settings.security.requireSpecialChars}
            onChange={(e) => updateSetting('security', 'requireSpecialChars', e.target.checked)}
            className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
          />
          <label htmlFor="requireSpecialChars" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Yêu cầu ký tự đặc biệt trong mật khẩu
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enableCaptcha"
            checked={settings.security.enableCaptcha}
            onChange={(e) => updateSetting('security', 'enableCaptcha', e.target.checked)}
            className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
          />
          <label htmlFor="enableCaptcha" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bật CAPTCHA
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('security')}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sao lưu gần nhất</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(settings.backup.lastBackup)}
            </p>
          </div>
          <button
            onClick={handleBackupNow}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang sao lưu...' : 'Sao lưu ngay'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="autoBackup"
          checked={settings.backup.autoBackup}
          onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
          className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
        />
        <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tự động sao lưu
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tần suất sao lưu
          </label>
          <select
            value={settings.backup.backupFrequency}
            onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
            disabled={!settings.backup.autoBackup}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none disabled:opacity-50"
          >
            <option value="hourly">Mỗi giờ</option>
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lưu trữ (ngày)
          </label>
          <input
            type="number"
            value={settings.backup.backupRetention}
            onChange={(e) => updateSetting('backup', 'backupRetention', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Vị trí lưu trữ
        </label>
        <select
          value={settings.backup.backupLocation}
          onChange={(e) => updateSetting('backup', 'backupLocation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
        >
          <option value="local">Máy chủ cục bộ</option>
          <option value="s3">Amazon S3</option>
          <option value="google">Google Drive</option>
          <option value="dropbox">Dropbox</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('backup')}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
            className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
          />
          <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bật thông báo email
          </label>
        </div>

        <div className="ml-7 space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="newUserRegistration"
              checked={settings.notifications.newUserRegistration}
              onChange={(e) => updateSetting('notifications', 'newUserRegistration', e.target.checked)}
              disabled={!settings.notifications.emailNotifications}
              className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white disabled:opacity-50"
            />
            <label htmlFor="newUserRegistration" className="text-sm text-gray-600 dark:text-gray-400">
              Người dùng mới đăng ký
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="newInvitationCreated"
              checked={settings.notifications.newInvitationCreated}
              onChange={(e) => updateSetting('notifications', 'newInvitationCreated', e.target.checked)}
              disabled={!settings.notifications.emailNotifications}
              className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white disabled:opacity-50"
            />
            <label htmlFor="newInvitationCreated" className="text-sm text-gray-600 dark:text-gray-400">
              Thiệp mời mới được tạo
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="systemAlerts"
              checked={settings.notifications.systemAlerts}
              onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
              disabled={!settings.notifications.emailNotifications}
              className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white disabled:opacity-50"
            />
            <label htmlFor="systemAlerts" className="text-sm text-gray-600 dark:text-gray-400">
              Cảnh báo hệ thống
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenanceAlerts"
              checked={settings.notifications.maintenanceAlerts}
              onChange={(e) => updateSetting('notifications', 'maintenanceAlerts', e.target.checked)}
              disabled={!settings.notifications.emailNotifications}
              className="w-4 h-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white disabled:opacity-50"
            />
            <label htmlFor="maintenanceAlerts" className="text-sm text-gray-600 dark:text-gray-400">
              Thông báo bảo trì
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('notifications')}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'email':
        return renderEmailSettings()
      case 'security':
        return renderSecuritySettings()
      case 'backup':
        return renderBackupSettings()
      case 'notifications':
        return renderNotificationSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt hệ thống</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý cấu hình và thiết lập hệ thống</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {tabs.find(t => t.id === activeTab)?.name}
              </h2>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardSettingsPage