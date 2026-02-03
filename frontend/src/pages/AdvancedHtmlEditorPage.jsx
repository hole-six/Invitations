import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import invitationService from '../services/invitation.service'
import { useToast } from '../context/ToastContext'

const AdvancedHtmlEditorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [htmlCode, setHtmlCode] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('basic') // basic, code, images
  
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
        setHtmlCode(res.data.html_content || '')
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
        html_content: htmlCode,
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
        html_content: htmlCode,
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
    
    try {
      setSaving(true)
      await invitationService.update(invitation.id, {
        ...formData,
        html_content: htmlCode
      })
      toast.success('✅ Đã lưu! Đang mở xem trước...')
      
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

  const insertPlaceholder = (placeholder) => {
    setHtmlCode(prev => prev + `{{${placeholder}}}`)
    toast.success(`Đã thêm {{${placeholder}}}`)
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
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-full px-4 py-4 flex items-center justify-between">
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
              <p className="text-sm text-gray-500">Advanced HTML Editor</p>
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
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'text-primary border-b-2 border-primary bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm mr-2 align-middle">edit_note</span>
              Thông Tin Cơ Bản
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'code'
                  ? 'text-primary border-b-2 border-primary bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm mr-2 align-middle">code</span>
              HTML/CSS Editor
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'images'
                  ? 'text-primary border-b-2 border-primary bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm mr-2 align-middle">image</span>
              Quản Lý Ảnh
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Thông Tin Thiệp Cưới</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu Đề</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Thiệp Cưới Của Chúng Tôi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên Chú Rể *</label>
                    <input
                      type="text"
                      name="groom_name"
                      value={formData.groom_name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên Cô Dâu *</label>
                    <input
                      type="text"
                      name="bride_name"
                      value={formData.bride_name}
                      onChange={handleChange}
                      placeholder="Trần Thị B"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Tổ Chức</label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giờ Tổ Chức</label>
                    <input
                      type="time"
                      name="event_time"
                      value={formData.event_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa Điểm</label>
                  <input
                    type="text"
                    name="event_location"
                    value={formData.event_location}
                    onChange={handleChange}
                    placeholder="Nhà Hàng Tiệc Cưới ABC"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa Chỉ</label>
                  <textarea
                    name="event_address"
                    value={formData.event_address}
                    onChange={handleChange}
                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">HTML/CSS Code</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => insertPlaceholder('groom_name')}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                    >
                      + Chú Rể
                    </button>
                    <button
                      onClick={() => insertPlaceholder('bride_name')}
                      className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
                    >
                      + Cô Dâu
                    </button>
                    <button
                      onClick={() => insertPlaceholder('event_date')}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      + Ngày
                    </button>
                    <button
                      onClick={() => insertPlaceholder('event_location')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      + Địa Điểm
                    </button>
                  </div>
                </div>

                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="Nhập HTML/CSS code của bạn..."
                  className="w-full h-[calc(100vh-300px)] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-sm resize-none"
                  spellCheck={false}
                />

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Placeholders:</strong> Sử dụng {`{{groom_name}}`}, {`{{bride_name}}`}, {`{{event_date}}`}, {`{{event_time}}`}, {`{{event_location}}`}, {`{{event_address}}`}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Quản Lý Ảnh</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">cloud_upload</span>
                  <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc click để chọn</p>
                  <p className="text-sm text-gray-500">Hỗ trợ: JPG, PNG, GIF (Max 5MB)</p>
                  <input type="file" className="hidden" accept="image/*" multiple />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>🚧 Tính năng đang phát triển</strong><br/>
                    Upload ảnh và quản lý thư viện ảnh sẽ có trong phiên bản tiếp theo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xem Trước</h3>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <iframe
                srcDoc={htmlCode}
                className="w-full h-[calc(100vh-200px)] border-0"
                title="Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedHtmlEditorPage
