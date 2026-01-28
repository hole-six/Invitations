import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import invitationService from '../services/invitation.service'

const HtmlInvitationViewPage = () => {
  const { slug } = useParams()
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)

  useEffect(() => {
    loadInvitation()
  }, [slug])

  const loadInvitation = async (pwd = null) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await invitationService.getPublicInvitation(slug, pwd)
      const invitationData = response.data
      
      setInvitation(invitationData)
      setShowPasswordPrompt(false)
      
      // Render HTML template
      if (invitationData.html_template) {
        renderHtmlTemplate(invitationData)
      }
    } catch (err) {
      console.error('Failed to load invitation:', err)
      
      if (err.message?.includes('password')) {
        setShowPasswordPrompt(true)
      } else {
        setError(err.message || 'Không tìm thấy thiệp mời')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderHtmlTemplate = (data) => {
    let html = data.html_template || ''
    
    // Replace placeholders with actual data
    html = html.replace(/\{\{groom_name\}\}/g, data.groom_name || 'Chú Rể')
    html = html.replace(/\{\{bride_name\}\}/g, data.bride_name || 'Cô Dâu')
    html = html.replace(/\{\{event_date\}\}/g, formatDate(data.event_date))
    html = html.replace(/\{\{event_time\}\}/g, formatTime(data.event_date))
    html = html.replace(/\{\{event_location\}\}/g, data.event_location || '')
    html = html.replace(/\{\{event_address\}\}/g, data.event_address || '')
    
    // Inject into iframe or directly into DOM
    const container = document.getElementById('html-template-container')
    if (container) {
      container.innerHTML = html
      
      // Execute scripts in the HTML
      const scripts = container.querySelectorAll('script')
      scripts.forEach(script => {
        const newScript = document.createElement('script')
        newScript.textContent = script.textContent
        document.body.appendChild(newScript)
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    loadInvitation(password)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thiệp mời...</p>
        </div>
      </div>
    )
  }

  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-3xl">lock</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thiệp Mời Được Bảo Vệ
            </h2>
            <p className="text-gray-600">
              Vui lòng nhập mật khẩu để xem thiệp mời
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl font-bold hover:from-primary-dark hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              Xem Thiệp Mời
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Không Tìm Thấy Thiệp Mời
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-full font-bold hover:from-primary-dark hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            Về Trang Chủ
          </a>
        </div>
      </div>
    )
  }

  return (
    <div id="html-template-container" className="min-h-screen">
      {/* HTML template will be injected here */}
    </div>
  )
}

export default HtmlInvitationViewPage
