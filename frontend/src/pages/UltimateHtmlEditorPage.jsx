import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import invitationService from '../services/invitation.service'
import { useToast } from '../context/ToastContext'

// Custom debounce hook for smooth preview
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const UltimateHtmlEditorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [htmlCode, setHtmlCode] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')

  // Ref for preview iframe
  const iframeRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    groom_name: '',
    bride_name: '',
    event_date: '',
    event_time: '14:00',
    event_location: '',
    event_address: '',
    music_url: '',
    music_autoplay: true
  })

  // Function to scroll preview to specific field
  const scrollPreviewToField = useCallback((fieldName) => {
    if (!iframeRef.current) return

    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
      if (!iframeDoc) return

      const selectorMap = {
        'title': '[data-field="title"], h1, .title',
        'groom_name': '[data-field="groom_name"], .groom-name, .groom',
        'bride_name': '[data-field="bride_name"], .bride-name, .bride',
        'event_date': '[data-field="event_date"], .event-date, .date',
        'event_time': '[data-field="event_time"], .event-time, .time',
        'event_location': '[data-field="event_location"], .event-location, .location',
        'event_address': '[data-field="event_address"], .event-address, .address'
      }

      const selector = selectorMap[fieldName]
      if (!selector) return

      const selectors = selector.split(', ')
      let element = null

      for (const sel of selectors) {
        element = iframeDoc.querySelector(sel)
        if (element) break
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })

        const originalBg = element.style.backgroundColor
        const originalTransition = element.style.transition
        element.style.transition = 'background-color 0.3s ease'
        element.style.backgroundColor = 'rgba(251, 191, 36, 0.3)'

        setTimeout(() => {
          element.style.backgroundColor = originalBg
          setTimeout(() => {
            element.style.transition = originalTransition
          }, 300)
        }, 1000)
      }
    } catch (error) {
      console.log('Could not scroll preview:', error)
    }
  }, [])

  // Phân tích template
  const templateAnalysis = useMemo(() => {
    if (!htmlCode) return { placeholders: [], images: [], customFields: [] }

    const placeholderRegex = /\{\{([a-z_]+)\}\}/gi
    const matches = [...htmlCode.matchAll(placeholderRegex)]
    const placeholders = [...new Set(matches.map(m => m[1]))]

    const imgWithEditableRegex = /<img[^>]*data-editable=["']([^"']+)["'][^>]*>/gi
    const editableMatches = [...htmlCode.matchAll(imgWithEditableRegex)]
    const imagesWithEditable = editableMatches.map((m) => {
      const fullTag = m[0]
      const editableId = m[1]
      const srcMatch = fullTag.match(/src=["']([^"']+)["']/i)
      const altMatch = fullTag.match(/alt=["']([^"']+)["']/i)
      const classMatch = fullTag.match(/class=["']([^"']+)["']/i)

      return {
        id: editableId,
        originalSrc: srcMatch?.[1] || '',
        currentSrc: srcMatch?.[1] || '',
        alt: altMatch?.[1] || editableId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        className: classMatch?.[1] || ''
      }
    })

    let images = imagesWithEditable
    if (images.length === 0) {
      const allImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
      const allMatches = [...htmlCode.matchAll(allImgRegex)]
      images = allMatches.map((m, idx) => {
        const fullTag = m[0]
        const src = m[1]
        const altMatch = fullTag.match(/alt=["']([^"']+)["']/i)
        const classMatch = fullTag.match(/class=["']([^"']+)["']/i)

        let id = `image_${idx + 1}`
        if (classMatch?.[1]) {
          id = classMatch[1].split(' ')[0].replace(/[^a-z0-9_]/gi, '_')
        } else if (altMatch?.[1]) {
          id = altMatch[1].toLowerCase().replace(/[^a-z0-9_]/gi, '_')
        }

        return {
          id,
          originalSrc: src,
          currentSrc: src,
          alt: altMatch?.[1] || `Ảnh ${idx + 1}`,
          className: classMatch?.[1] || '',
          index: idx
        }
      })
    }

    const customFieldRegex = /data-editable=["']([^"']+)["'][^>]*>([^<]+)</gi
    const customMatches = [...htmlCode.matchAll(customFieldRegex)]
    const customFields = customMatches
      .filter(m => !m[0].includes('<img'))
      .map((m, idx) => ({
        id: m[1] || `custom-${idx}`,
        label: m[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: m[2],
        type: 'text'
      }))

    return { placeholders, images, customFields }
  }, [htmlCode])

  const [imageData, setImageData] = useState({})
  const [customFieldData, setCustomFieldData] = useState({})

  const debouncedFormData = useDebounce(formData, 300)
  const debouncedImageData = useDebounce(imageData, 300)
  const debouncedCustomFieldData = useDebounce(customFieldData, 300)

  useEffect(() => {
    loadInvitation()
  }, [])

  useEffect(() => {
    updatePreview()
  }, [debouncedFormData, debouncedImageData, debouncedCustomFieldData, htmlCode])

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
          event_address: res.data.event_address || '',
          music_url: res.data.music_url || '',
          music_autoplay: res.data.music_autoplay !== undefined ? res.data.music_autoplay : true
        })

        if (res.data.image_data) {
          try {
            setImageData(JSON.parse(res.data.image_data))
          } catch (e) {
            console.error('Failed to parse image_data:', e)
          }
        }

        if (res.data.custom_field_data) {
          try {
            setCustomFieldData(JSON.parse(res.data.custom_field_data))
          } catch (e) {
            console.error('Failed to parse custom_field_data:', e)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load invitation:', error)
      toast.error('Không thể tải thiệp mời')
    } finally {
      setLoading(false)
    }
  }

  const updatePreview = () => {
    let html = htmlCode

    Object.keys(debouncedFormData).forEach(key => {
      const value = debouncedFormData[key]
      if (value && key !== 'music_url' && key !== 'music_autoplay') {
        if (key === 'event_date') {
          const date = new Date(value)
          const formatted = date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
          html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), formatted)
        } else {
          html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
        }
      }
    })

    templateAnalysis.images.forEach(img => {
      if (debouncedImageData[img.id]) {
        const newSrc = debouncedImageData[img.id]
        const regex1 = new RegExp(`(<img[^>]*data-editable=["']${img.id}["'][^>]*src=["'])([^"']+)(["'])`, 'gi')
        html = html.replace(regex1, `$1${newSrc}$3`)

        const regex2 = new RegExp(`(<img[^>]*)(src=["'])([^"']+)(["'][^>]*data-editable=["']${img.id}["'])`, 'gi')
        html = html.replace(regex2, `$1$2${newSrc}$4`)

        if (img.originalSrc) {
          html = html.replace(img.originalSrc, newSrc)
        }
      }
    })

    Object.keys(debouncedCustomFieldData).forEach(key => {
      const regex = new RegExp(`(data-editable=["']${key}["'][^>]*>)([^<]+)(<)`, 'g')
      html = html.replace(regex, `$1${debouncedCustomFieldData[key]}$3`)
    })

    if (debouncedFormData.music_url) {
      const musicPlayer = `
        <div id="music-player" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
          <audio id="background-music" ${debouncedFormData.music_autoplay ? 'autoplay' : ''} loop>
            <source src="${debouncedFormData.music_url}" type="audio/mpeg">
          </audio>
          <button id="music-toggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
            <svg id="play-icon" style="display: ${debouncedFormData.music_autoplay ? 'none' : 'block'}; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg id="pause-icon" style="display: ${debouncedFormData.music_autoplay ? 'block' : 'none'}; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
          </button>
        </div>
        <script>
          (function() {
            const audio = document.getElementById('background-music');
            const toggle = document.getElementById('music-toggle');
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            
            toggle.addEventListener('click', function() {
              if (audio.paused) {
                audio.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
              } else {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
              }
            });
          })();
        </script>
      `
      html = html.replace('</body>', `${musicPlayer}</body>`)
    }

    setPreviewHtml(html)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCustomFieldChange = (fieldId, value) => {
    setCustomFieldData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleImageUpload = async (imageId, file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB!')
      return
    }

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageData(prev => ({
          ...prev,
          [imageId]: reader.result
        }))
        toast.success('✅ Đã tải ảnh lên!')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('❌ Không thể tải ảnh lên!')
    }
  }

  const handleSave = async () => {
    if (!invitation) return

    try {
      setSaving(true)
      await invitationService.update(invitation.id, {
        ...formData,
        html_content: htmlCode,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData)
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
      await invitationService.update(invitation.id, {
        ...formData,
        html_content: htmlCode,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: 'published'
      })
      await invitationService.publish(invitation.id)
      toast.success('🎉 Đã xuất bản thiệp mời!')
      setTimeout(() => {
        navigate(`/invitation/${invitation.slug}`)
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
        html_content: htmlCode,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData)
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
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-white dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Header - Clean & Modern */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/management')}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <img width="50" height="50" src="https://img.icons8.com/bubbles/50/create-new.png" alt="create-new" />
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {invitation?.title || 'Chỉnh Sửa Thiệp Mời'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Đang chỉnh sửa
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={handlePreview}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Xem Trước
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Xuất Bản
            </button>
          </div>
        </div>
      </header>

      {/* Content - Split View */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Form - Clean Design */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Chỉnh Sửa Nội Dung
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Thay đổi sẽ hiển thị ngay bên phải
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                <img width="50" height="50" src="https://img.icons8.com/clouds/100/info--v1.png" alt="info--v1" />                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Thông Tin Cơ Bản
                </h4>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <img width="30" height="30" src="https://img.icons8.com/clouds/100/open-envelope-love.png" alt="open-envelope-love" />
                  Tiêu Đề
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onFocus={() => scrollPreviewToField('title')}
                  placeholder="Thiệp Cưới Của Chúng Tôi"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:text-white outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <img width="30" height="30" src="https://img.icons8.com/stickers/100/groom.png" alt="groom" />Tên Chú Rể
                  </label>
                  <input
                    type="text"
                    name="groom_name"
                    value={formData.groom_name}
                    onChange={handleChange}
                    onFocus={() => scrollPreviewToField('groom_name')}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:text-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <img width="30" height="30" src="https://img.icons8.com/clouds/100/bride.png" alt="bride" />
                    Tên cô dâu
                  </label>
                  <input
                    type="text"
                    name="bride_name"
                    value={formData.bride_name}
                    onChange={handleChange}
                    onFocus={() => scrollPreviewToField('bride_name')}
                    placeholder="Trần Thị B"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <img width="30" height="30" src="https://img.icons8.com/clouds/100/calendar--v2.png" alt="calendar--v2" /> Ngày tổ chức
                  </label>
                  <DatePicker
                    selected={formData.event_date && !isNaN(new Date(formData.event_date)) ? new Date(formData.event_date) : null}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        handleChange({ target: { name: 'event_date', value: `${year}-${month}-${day}` } })
                      }
                    }}
                    onFocus={() => scrollPreviewToField('event_date')}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:text-white outline-none transition-colors"
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <img width="30" height="30" src="https://img.icons8.com/clouds/100/--pocket-watch.png" alt="--pocket-watch" />
                    Giờ
                  </label>
                  <DatePicker
                    selected={formData.event_time && !isNaN(new Date(`2000-01-01T${formData.event_time}`)) ? new Date(`2000-01-01T${formData.event_time}`) : null}
                    onChange={(date) => {
                      if (date) {
                        const hours = String(date.getHours()).padStart(2, '0')
                        const minutes = String(date.getMinutes()).padStart(2, '0')
                        handleChange({ target: { name: 'event_time', value: `${hours}:${minutes}` } })
                      }
                    }}
                    onFocus={() => scrollPreviewToField('event_time')}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Giờ"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    placeholderText="Chọn giờ"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white outline-none transition-colors"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <img width="30" height="30" src="https://img.icons8.com/clouds/100/marker.png" alt="marker" /> Địa Điểm
                </label>
                <input
                  type="text"
                  name="event_location"
                  value={formData.event_location}
                  onChange={handleChange}
                  onFocus={() => scrollPreviewToField('event_location')}
                  placeholder="Nhà Hàng Tiệc Cưới ABC"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <img width="30" height="30" src="https://img.icons8.com/clouds/100/address.png" alt="address" />
                  Địa Chỉ
                </label>
                <textarea
                  name="event_address"
                  value={formData.event_address}
                  onChange={handleChange}
                  onFocus={() => scrollPreviewToField('event_address')}
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white outline-none resize-none transition-colors"
                />
              </div>
            </div>

            {/* Music Section */}
            <div className="space-y-6 pt-6 border-t-2 border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 pb-3">
                <img width="50" height="50" src="https://img.icons8.com/clouds/100/musical-notes.png" alt="musical-notes" />
                <div>
                  <h4 className="text-xl font-bold text-stone-900 dark:text-white font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Nhạc Nền
                  </h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Chọn nhạc có sẵn hoặc thêm link riêng
                  </p>
                </div>
              </div>

              {/* Preset Songs */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2.5">
                  <img width="25" height="25" src="https://img.icons8.com/clouds/100/music-library.png" alt="music-library" />
                  Nhạc Có Sẵn
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'A Thousand Years - Christina Perri', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                    { name: 'Perfect - Ed Sheeran', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
                    { name: 'All of Me - John Legend', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
                    { name: 'Marry You - Bruno Mars', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
                    { name: 'Thinking Out Loud - Ed Sheeran', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
                  ].map((song, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, music_url: song.url }))}
                      className={`text-left px-4 py-3 rounded-xl border-2 transition-all duration-300 ${formData.music_url === song.url
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-600 text-stone-700 dark:text-stone-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                        <span className="font-medium">{song.name}</span>
                        {formData.music_url === song.url && (
                          <svg className="w-5 h-5 ml-auto text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL or YouTube */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2.5">
                  <img width="25" height="25" src="https://img.icons8.com/clouds/100/link.png" alt="link" />
                  Link Tùy Chỉnh
                </label>
                <input
                  type="text"
                  name="music_url"
                  value={formData.music_url}
                  onChange={handleChange}
                  placeholder="https://example.com/music.mp3 hoặc https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3.5 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-stone-800 dark:text-white outline-none transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-600 font-medium"
                />
                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                  💡 Hỗ trợ: MP3, WAV, OGG, YouTube link. Paste link YouTube để tự động chuyển đổi.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 px-4 py-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-all">
                  <input
                    type="checkbox"
                    name="music_autoplay"
                    checked={formData.music_autoplay}
                    onChange={(e) => setFormData(prev => ({ ...prev, music_autoplay: e.target.checked }))}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  />
                  <img width="30" height="30" src="https://img.icons8.com/clouds/100/play.png" alt="play" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-pink-800 dark:text-pink-300">Tự động phát nhạc</span>
                    <p className="text-xs text-pink-600 dark:text-pink-400 mt-0.5">
                      Nhạc sẽ tự động phát khi mở thiệp (một số trình duyệt có thể chặn autoplay)
                    </p>
                  </div>
                </label>
              </div>

              {formData.music_url && !formData.music_url.includes('youtube') && !formData.music_url.includes('youtu.be') && (
                <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border-2 border-pink-200 dark:border-pink-800">
                  <p className="flex items-center gap-2 text-sm font-semibold text-pink-800 dark:text-pink-300 mb-2">
                    <img width="30" height="30" src="https://img.icons8.com/clouds/100/high-volume.png" alt="high-volume" /> Nghe thử:
                  </p>
                  <audio controls className="w-full" src={formData.music_url}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {formData.music_url && (formData.music_url.includes('youtube') || formData.music_url.includes('youtu.be')) && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                    <img width="25" height="25" src="https://img.icons8.com/clouds/100/youtube-play.png" alt="youtube-play" />
                    YouTube Preview:
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${formData.music_url.includes('youtu.be')
                        ? formData.music_url.split('youtu.be/')[1]?.split('?')[0]
                        : formData.music_url.split('v=')[1]?.split('&')[0]}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Images Section */}
            {templateAnalysis.images.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-stone-200 dark:border-stone-800">
                  <img width="50" height="50" src="https://img.icons8.com/clouds/100/image.png" alt="image" />
                  <div>
                    <h4 className="text-xl font-bold text-stone-900 dark:text-white font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Quản Lý Ảnh
                    </h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {templateAnalysis.images.length} ảnh được phát hiện
                    </p>
                  </div>
                </div>

                {templateAnalysis.images.map((img, idx) => {
                  // Icon số từ icons8 - clouds style (1-25)
                  const numberIcons = [
                    'https://img.icons8.com/clouds/100/1--v2.png',
                    'https://img.icons8.com/clouds/100/2--v2.png',
                    'https://img.icons8.com/clouds/100/3--v2.png',
                    'https://img.icons8.com/clouds/100/4--v2.png',
                    'https://img.icons8.com/clouds/100/5--v2.png',
                    'https://img.icons8.com/clouds/100/6--v2.png',
                    'https://img.icons8.com/clouds/100/7--v2.png',
                    'https://img.icons8.com/clouds/100/8--v2.png',
                    'https://img.icons8.com/clouds/100/9--v2.png',
                    'https://img.icons8.com/clouds/100/10--v2.png',
                    'https://img.icons8.com/dusk/64/circled-10.png',
                    'https://img.icons8.com/dusk/64/circled-11.png',
                   
                  ]

                  return (
                    <div key={img.id} className="group relative border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-xl hover:shadow-purple-500/10">
                      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4 flex items-center gap-2">
                        <img
                          width="28"
                          height="28"
                          src={numberIcons[idx] || numberIcons[0]}
                          alt={`number-${idx + 1}`}
                          className="flex-shrink-0"
                        />
                        {img.alt}
                      </label>

                      <div className="flex items-start gap-5">
                        {/* Preview */}
                        <div className="w-36 h-36 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden flex-shrink-0 group-hover:border-purple-400 dark:group-hover:border-purple-600 transition-all shadow-lg">
                          <img
                            src={imageData[img.id] || img.originalSrc}
                            alt={img.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Upload */}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(img.id, e.target.files[0])}
                            className="hidden"
                            id={`upload-${img.id}`}
                          />
                          <label
                            htmlFor={`upload-${img.id}`}
                            className="block w-full px-6 py-8 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group/upload"
                          >
                            <svg className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto mb-3 group-hover/upload:text-purple-500 group-hover/upload:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              Click để chọn ảnh mới
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              JPG, PNG, GIF • Tối đa 5MB
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Custom Fields Section */}
            {templateAnalysis.customFields.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-stone-200 dark:border-stone-800">
                  <img width="50" height="50" src="https://img.icons8.com/clouds/100/edit-property.png" alt="edit-property" />
                  <div>
                    <h4 className="text-xl font-bold text-stone-900 dark:text-white font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Nội Dung Tùy Chỉnh
                    </h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {templateAnalysis.customFields.length} trường tùy chỉnh
                    </p>
                  </div>
                </div>

                {templateAnalysis.customFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-2">
                      <img width="30" height="30" src="https://img.icons8.com/clouds/100/info--v1.png" alt="info--v1"/>
                      {field.label}
                    </label>
                    <textarea
                      value={customFieldData[field.id] !== undefined ? customFieldData[field.id] : field.value}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3.5 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-stone-800 dark:text-white outline-none resize-none transition-all hover:border-stone-300 dark:hover:border-stone-600"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Info Box - VIP Style */}
            {/* <div className="relative p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="relative flex items-start gap-4">
                <img width="50" height="50" src="https://img.icons8.com/clouds/100/lightning-bolt.png" alt="lightning-bolt" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-300 font-bold mb-1">Real-time Preview</p>
                  <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                    Mọi thay đổi sẽ hiển thị ngay lập tức bên phải.
                    Nhớ click <strong>"Lưu"</strong> để lưu vào database!
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right Panel - Preview - VIP Style */}
        <div className="w-1/2 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img width="50" height="50" src="https://img.icons8.com/clouds/100/visible.png" alt="visible" />
                <div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Xem Trước Real-time
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">Live Preview</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-stone-200 dark:border-stone-800">
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                className="w-full h-[calc(100vh-250px)] border-0"
                title="Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UltimateHtmlEditorPage

// Custom CSS for react-datepicker
const style = document.createElement('style')
style.textContent = `
  /* Custom DatePicker Styles */
  .react-datepicker {
    font-family: inherit;
    border: 2px solid #e7e5e4;
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
  
  .react-datepicker__header {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    border-bottom: none;
    border-radius: 0.875rem 0.875rem 0 0;
    padding: 1rem;
  }
  
  .react-datepicker__current-month,
  .react-datepicker-time__header {
    color: white;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .react-datepicker__day-name {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    font-size: 0.875rem;
    width: 2.5rem;
    line-height: 2.5rem;
    margin: 0.166rem;
  }
  
  .react-datepicker__day {
    width: 2.5rem;
    line-height: 2.5rem;
    margin: 0.166rem;
    border-radius: 0.75rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .react-datepicker__day:hover {
    background: #fef3c7;
    color: #92400e;
    transform: scale(1.1);
  }
  
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    color: white;
    font-weight: 700;
    transform: scale(1.1);
  }
  
  .react-datepicker__day--today {
    font-weight: 700;
    color: #f59e0b;
    border: 2px solid #fbbf24;
  }
  
  .react-datepicker__navigation {
    top: 1.25rem;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: white;
    border-width: 2px 2px 0 0;
  }
  
  .react-datepicker__time-container {
    border-left: 2px solid #e7e5e4;
  }
  
  .react-datepicker__time-list-item {
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .react-datepicker__time-list-item:hover {
    background: #f3e8ff !important;
    color: #6b21a8;
  }
  
  .react-datepicker__time-list-item--selected {
    background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%) !important;
    color: white !important;
    font-weight: 700;
  }
  
  .react-datepicker__triangle {
    display: none;
  }
  
  /* Dark mode support */
  .dark .react-datepicker {
    background: #1c1917;
    border-color: #44403c;
  }
  
  .dark .react-datepicker__header {
    background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
  }
  
  .dark .react-datepicker__day {
    color: #e7e5e4;
  }
  
  .dark .react-datepicker__day:hover {
    background: #44403c;
    color: #fbbf24;
  }
  
  .dark .react-datepicker__time-container {
    border-left-color: #44403c;
  }
  
  .dark .react-datepicker__time-list-item {
    color: #e7e5e4;
  }
`
if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}