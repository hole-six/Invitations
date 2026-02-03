import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import invitationService from '../services/invitation.service'
import { useToast } from '../context/ToastContext'

const HtmlEditorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    groom_name: '',
    bride_name: '',
    event_date: '',
    event_time: '14:00',
    event_location: '',
    event_address: ''
  })

  useEffect(() => {
    loadInvitation()
  }, [])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      const invitationId = searchParams.get('invitationId')
      
      if (invitationId) {
        const res = await invitationService.getById(invitationId)
        setInvitation(res.data)
        setFormData({
          title: res.data.title || '',
          groom_name: res.data.groom_name || '',
          bride_name: res.data.bride_name || '',
          event_date: res.data.event_date ? res.data.event_date.split('T')[0] : '',
          event_time: res.data.event_time || '14:00',
          event_location: res.data.event_location || '',
          event_address: res.data.event_address || ''
        })
      }
    } catch (error) {
      console.error('Failed to load invitation:', error)
      toast.error('Không thể tải thiệp mời')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!invitation) return
    
    try {
      setSaving(true)
      await invitationService.update(invitation.id, {
        ...formData,
        status: invitation.status // Keep current status
      })
      toast.success('✅ Đã lưu thành công!')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('❌ Lưu thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!invitation) return
    
    if (!formData.groom_name || !formData.bride_name) {
      toast.warning('⚠️ Vui lòng nhập tên chú rể và cô dâu!')
      return
    }
    
    try {
      setSaving(true)
      
      // Update invitation
      const updateResponse = await invitationService.update(invitation.id, {
        ...formData,
        status: 'published'
      })
      
      // Publish
      await invitationService.publish(invitation.id)
      
      // Get updated slug
      const updatedInvitation = updateResponse.data || invitation
      const newSlug = updatedInvitation.slug || invitation.slug
      
      toast.success('🎉 Đã xuất bản thiệp mời!')
      setTimeout(() => {
        navigate(`/invitation/${newSlug}`)
      }, 1500)
    } catch (error) {
      console.error('Publish failed:', error)
      toast.error('❌ Xuất bản thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    if (!invitation) return
    
    // Auto-save before preview
    try {
      setSaving(true)
      await invitationService.update(invitation.id, formData)
      toast.success('✅ Đã lưu! Đang mở xem trước...')
      
      // Wait a bit for save to complete
      setTimeout(() => {
        window.open(`/invitation/${invitation.slug}`, '_blank')
        setSaving(false)
      }, 500)
    } catch (error) {
      console.error('Save before preview failed:', error)
      toast.error('❌ Không thể lưu. Vui lòng thử lại!')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/management')}
              className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {invitation?.title || 'Chỉnh Sửa Thiệp Mời'}
              </h2>
              <p className="text-sm text-gray-500">HTML Template Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button 
              onClick={handlePreview}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              Xem Trước
            </button>
            <button 
              onClick={handlePublish}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-primary to-pink-500 hover:from-primary-dark hover:to-pink-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">publish</span>
              Xuất Bản
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Thiệp Cưới</h3>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu Đề
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Thiệp Cưới Của Chúng Tôi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Couple Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Chú Rể *
                </label>
                <input
                  type="text"
                  name="groom_name"
                  value={formData.groom_name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Cô Dâu *
                </label>
                <input
                  type="text"
                  name="bride_name"
                  value={formData.bride_name}
                  onChange={handleChange}
                  placeholder="Trần Thị B"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Event Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Tổ Chức
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ Tổ Chức
                </label>
                <input
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Event Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa Điểm
              </label>
              <input
                type="text"
                name="event_location"
                value={formData.event_location}
                onChange={handleChange}
                placeholder="Nhà Hàng Tiệc Cưới ABC"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Event Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa Chỉ
              </label>
              <textarea
                name="event_address"
                value={formData.event_address}
                onChange={handleChange}
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">info</span>
              <div>
                <p className="text-sm text-blue-900 font-medium">Hướng Dẫn Sử Dụng</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Lưu:</strong> Lưu thông tin vào database (chưa công khai)</li>
                  <li><strong>Xem Trước:</strong> Tự động lưu và mở tab mới để xem thiệp</li>
                  <li><strong>Xuất Bản:</strong> Lưu và công khai thiệp mời cho mọi người xem</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  💡 <strong>Lưu ý:</strong> Nhấn "Lưu" hoặc "Xem Trước" trước khi đóng trang để không mất dữ liệu!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HtmlEditorPage
