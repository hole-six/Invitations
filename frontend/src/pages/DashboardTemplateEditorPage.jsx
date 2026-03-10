import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../context/ToastContext'
import templateService from '../services/template.service'

const DashboardTemplateEditorPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const decodedId = id ? decodeURIComponent(id) : ''
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('basic') // basic | html | preview

  const [formData, setFormData] = useState({
    uuid: '', // Add uuid field
    name: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    category_id: 1,
    is_premium: false,
    template_type: 'html',
    html_template: '',
    design_data: null,
    tags: []
  })

  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadCategories()
    if (decodedId) {
      loadTemplate(decodedId)
    }
  }, [decodedId])

  const loadCategories = async () => { 
    try {
      const response = await templateService.getCategories()
      const filtered = (response.data || []).filter(cat => !cat.deleted_at)

      setCategories(filtered)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
}

  const loadTemplate = async (templateId) => {
    try {
      setLoading(true)
      const response = await templateService.getById(templateId)
      const template = response.data

      console.log('📦 Loaded template:', template);
      console.log('📄 html_template length:', template.html_template?.length || 0);

      // Get html_template with fallback to design_data.html
      let htmlContent = template.html_template || '';
      
      // If html_template is empty, try to get from design_data
      if (!htmlContent && template.design_data) {
        try {
          const designData = typeof template.design_data === 'string'
            ? JSON.parse(template.design_data)
            : template.design_data;
          
          if (designData?.html) {
            console.log('📄 Loading HTML from design_data');
            htmlContent = designData.html;
          }
        } catch (parseErr) {
          console.error('Failed to parse design_data:', parseErr);
        }
      }

      console.log('✅ Final htmlContent length:', htmlContent.length);

      setFormData({
        uuid: template.uuid || '', // Store uuid
        name: template.name || '',
        slug: template.slug || '',
        description: template.description || '',
        thumbnail_url: template.thumbnail_url || '',
        category_id: template.category_id || 1,
        is_premium: template.is_premium === 1 || template.is_premium === true,
        template_type: template.template_type || 'html',
        html_template: htmlContent, // Use fallback HTML
        design_data: template.design_data ? (typeof template.design_data === 'string' ? template.design_data : JSON.stringify(template.design_data, null, 2)) : null,
        tags: template.tags || []
      })
    } catch (error) {
      console.error('Failed to load template:', error)
      toast.error('Không thể tải template')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        is_premium: formData.is_premium ? 1 : 0
      }

      // Parse design_data if it's a string
      if (submitData.design_data && typeof submitData.design_data === 'string') {
        try {
          submitData.design_data = JSON.parse(submitData.design_data)
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }

      // Convert tags array to JSON string for database
      if (Array.isArray(submitData.tags)) {
        submitData.tags = JSON.stringify(submitData.tags)
      } else if (!submitData.tags) {
        submitData.tags = '[]' // Empty array as string
      }

      console.log('📤 Submitting template data:', submitData)

      let response
      if (decodedId) {
        // Use uuid from formData if available, otherwise use id
        const identifier = formData.uuid || decodedId;
        response = await templateService.update(identifier, submitData)
        toast.success('✨ Template đã được cập nhật thành công!')
      } else {
        response = await templateService.create(submitData)
        toast.success('✨ Template đã được tạo thành công!')
      }

      // Navigate back to templates list
      setTimeout(() => {
        navigate('/dashboard/templates')
      }, 1000)
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error(`❌ Không thể lưu template: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatJSON = () => {
    if (formData.design_data) {
      try {
        const parsed = JSON.parse(formData.design_data)
        setFormData(prev => ({
          ...prev,
          design_data: JSON.stringify(parsed, null, 2)
        }))
        toast.success('JSON đã được format')
      } catch (e) {
        toast.error('JSON không hợp lệ')
      }
    }
  }

  if (loading && id) {
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

      <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {decodedId ? 'Chỉnh sửa Template' : 'Tạo Template Mới'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {decodedId ? 'Cập nhật thông tin template' : 'Tạo template mới cho hệ thống'}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/templates')}
            className="w-full md:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <nav className="flex gap-4 min-w-max">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-3 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'basic'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Thông tin cơ bản
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-4 py-3 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'html'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              HTML & Design
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-3 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'preview'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Xem trước
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên Template *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
                    placeholder="VD: Luxury Gold Rose Wedding"
                  />
                </div>

                {/* Slug */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL) *
                  </label>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
                      placeholder="luxury-gold-rose-wedding"
                    />
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      Tự động tạo
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none resize-none transition-all"
                    placeholder="Mô tả ngắn gọn về template..."
                  />
                </div>

                {/* Thumbnail URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.thumbnail_url && (
                    <div className="mt-3 relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={formData.thumbnail_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Danh mục *
                  </label>
                  <div className="relative">
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none appearance-none transition-all"
                    >
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))
                      ) : (
                        <>
                          <option value={1}>Cổ Điển</option>
                          <option value={2}>Hiện Đại</option>
                          <option value={3}>Lãng Mạn</option>
                          <option value={4}>Sang Trọng</option>
                        </>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* Template Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loại Template
                  </label>
                  <div className="relative">
                    <select
                      name="template_type"
                      value={formData.template_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none appearance-none transition-all"
                    >
                      <option value="html">HTML</option>
                      <option value="canvas">Canvas</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* Premium */}
                <div className="md:col-span-2">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <input
                      type="checkbox"
                      id="is_premium"
                      name="is_premium"
                      checked={formData.is_premium}
                      onChange={handleChange}
                      className="w-5 h-5 text-gray-900 dark:text-white rounded border-gray-300 focus:ring-gray-900 dark:focus:ring-white"
                    />
                    <label htmlFor="is_premium" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                      Template Premium (yêu cầu gói trả phí)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HTML & Design Tab */}
          {activeTab === 'html' && (
            <div className="space-y-6">
              {/* HTML Content */}
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    HTML Content {formData.template_type === 'html' && '*'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="w-full md:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded-lg text-xs font-medium"
                  >
                    {previewMode ? 'Chỉnh sửa Code' : 'Xem Preview nhanh'}
                  </button>
                </div>
                {!previewMode ? (
                  <textarea
                    name="html_template"
                    value={formData.html_template}
                    onChange={handleChange}
                    required={formData.template_type === 'html'}
                    rows={20}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none resize-y font-mono text-xs md:text-sm"
                    placeholder="<!DOCTYPE html>..."
                  />
                ) : (
                  <div className="border border-gray-300 dark:border-gray-600 bg-white rounded-lg overflow-hidden">
                    {formData.html_template ? (
                      <iframe
                        srcDoc={formData.html_template}
                        className="w-full h-[500px] md:h-[600px]"
                        title="HTML Preview"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-400">
                        <p>Nhập HTML để xem preview</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Design Data (JSON) */}
              {/* <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Design Data (JSON) {formData.template_type === 'canvas' && '*'}
                  </label>
                  <button
                    type="button"
                    onClick={formatJSON}
                    className="w-full md:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded-lg text-xs font-medium"
                  >
                    Format JSON
                  </button>
                </div>
                <textarea
                  name="design_data"
                  value={formData.design_data || ''}
                  onChange={handleChange}
                  required={formData.template_type === 'canvas'}
                  rows={15}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none resize-y font-mono text-xs md:text-sm"
                  placeholder='{"canvas": {...}, "elements": [...]}'
                />
              </div> */}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Live Preview
              </h3>
              <div className="border border-gray-200 dark:border-gray-700 bg-white rounded-lg overflow-hidden shadow-inner">
                {formData.html_template ? (
                  <iframe
                    srcDoc={formData.html_template}
                    className="w-full h-[600px] md:h-[800px]"
                    title="Template Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-gray-400">
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p className="text-sm">Nhập HTML content để xem preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Action Buttons Mobile / Fixed Desktop */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:relative md:border-t-0 md:bg-transparent md:p-0 z-40 md:z-auto">
            <div className="flex flex-col md:flex-row justify-end gap-3 max-w-[1440px] mx-auto">
              <button
                type="button"
                onClick={() => navigate('/dashboard/templates')}
                className="w-full md:w-auto px-6 py-3 md:py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm order-2 md:order-1"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 md:py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 md:order-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{id ? 'Cập nhật Template' : 'Lưu Template'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default DashboardTemplateEditorPage

