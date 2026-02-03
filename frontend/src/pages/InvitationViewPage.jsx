import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import invitationService from '../services/invitation.service'
import CanvasElement from '../components/editor/CanvasElement'

const InvitationViewPage = () => {
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

      console.log('📧 Invitation loaded:', invitationData)

      // Parse design_data if it's a string
      if (typeof invitationData.design_data === 'string') {
        try {
          invitationData.design_data = JSON.parse(invitationData.design_data)
        } catch (e) {
          console.error('Failed to parse design_data:', e)
        }
      }

      setInvitation(invitationData)
      setShowPasswordPrompt(false)

      // If this is an HTML template, render it in a container
      if (invitationData.html_content) {
        console.log('🌐 Rendering HTML template...')
        setTimeout(() => renderHtmlTemplate(invitationData), 100)
      }
    } catch (err) {
      console.error('❌ Failed to load invitation:', err)

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
    let html = data.html_content || ''

    // Replace placeholders with actual data
    html = html.replace(/\{\{title\}\}/g, data.title || 'Wedding Invitation')
    html = html.replace(/\{\{groom_name\}\}/g, data.groom_name || 'Chú Rể')
    html = html.replace(/\{\{bride_name\}\}/g, data.bride_name || 'Cô Dâu')
    html = html.replace(/\{\{event_date\}\}/g, formatDate(data.event_date))
    html = html.replace(/\{\{event_time\}\}/g, formatTime(data.event_date) || data.event_time || '')
    html = html.replace(/\{\{event_location\}\}/g, data.event_location || '')
    html = html.replace(/\{\{event_address\}\}/g, data.event_address || '')
    html = html.replace(/\{\{music_url\}\}/g, data.music_url || '')

    // Replace images from image_data
    if (data.image_data) {
      try {
        const imageData = typeof data.image_data === 'string'
          ? JSON.parse(data.image_data)
          : data.image_data

        console.log('🖼️ Image data:', imageData)

        // Replace images by data-editable attribute
        Object.keys(imageData).forEach(key => {
          const imageUrl = imageData[key]
          console.log(`🔄 Replacing image ${key} with:`, imageUrl.substring(0, 50) + '...')

          // Method 1: Replace by data-editable attribute (most reliable)
          const regex1 = new RegExp(`(<img[^>]*data-editable=["']${key}["'][^>]*src=["'])([^"']+)(["'])`, 'gi')
          const before1 = html
          html = html.replace(regex1, `$1${imageUrl}$3`)
          if (html !== before1) console.log(`✅ Replaced using data-editable="${key}"`)

          // Method 2: Replace by src attribute containing data-editable nearby
          const regex2 = new RegExp(`(<img[^>]*)(src=["'])([^"']+)(["'][^>]*data-editable=["']${key}["'])`, 'gi')
          const before2 = html
          html = html.replace(regex2, `$1$2${imageUrl}$4`)
          if (html !== before2) console.log(`✅ Replaced using src before data-editable`)

          // Method 3: Replace by class name (fallback)
          const regex3 = new RegExp(`(<img[^>]*class=["'][^"']*${key}[^"']*["'][^>]*src=["'])([^"']+)(["'])`, 'gi')
          const before3 = html
          html = html.replace(regex3, `$1${imageUrl}$3`)
          if (html !== before3) console.log(`✅ Replaced using class="${key}"`)
        })
      } catch (e) {
        console.error('Failed to parse image_data:', e)
      }
    }

    // Replace custom fields from custom_field_data
    if (data.custom_field_data) {
      try {
        const customFieldData = typeof data.custom_field_data === 'string'
          ? JSON.parse(data.custom_field_data)
          : data.custom_field_data

        console.log('✏️ Custom field data:', customFieldData)

        Object.keys(customFieldData).forEach(key => {
          const value = customFieldData[key]
          const regex = new RegExp(`(data-editable="${key}"[^>]*>)([^<]+)(<)`, 'g')
          html = html.replace(regex, `$1${value}$3`)
        })
      } catch (e) {
        console.error('Failed to parse custom_field_data:', e)
      }
    }

    // Inject music player if music_url is provided
    if (data.music_url) {
      console.log('🎵 Adding music player:', data.music_url)

      // Check if it's a YouTube link
      const isYouTube = data.music_url.includes('youtube.com') || data.music_url.includes('youtu.be')
      let videoId = ''

      if (isYouTube) {
        // Extract YouTube video ID
        if (data.music_url.includes('youtu.be/')) {
          videoId = data.music_url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
        } else if (data.music_url.includes('v=')) {
          videoId = data.music_url.split('v=')[1]?.split('&')[0]
        }
        console.log('🎬 YouTube video ID:', videoId)
      }

      const musicPlayer = isYouTube ? `
        <!-- YouTube Music Player -->
        <div id="music-player" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: ${data.music_autoplay ? 'none' : 'block'};">
          <div id="youtube-player-container" style="display: none;">
            <div id="youtube-player"></div>
          </div>
          <button id="music-toggle" style="
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
            border: none;
            box-shadow: 0 10px 30px rgba(255, 0, 0, 0.4);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
          " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <svg id="play-icon" style="display: block; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg id="pause-icon" style="display: none; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            <svg id="loading-icon" style="display: none; width: 24px; height: 24px; animation: spin 1s linear infinite;" fill="white" viewBox="0 0 24 24">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
          </button>
          <div id="click-to-play" style="
            position: absolute;
            bottom: 80px;
            right: 0;
            background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 30px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(255, 0, 0, 0.4);
            cursor: pointer;
            white-space: nowrap;
            animation: pulse 2s infinite;
            display: none;
          " onclick="document.getElementById('music-toggle').click()">
            🎵 Click để phát nhạc
          </div>
        </div>
        <style>
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }
        </style>
        <script src="https://www.youtube.com/iframe_api"></script>
        <script>
          (function() {
            let player;
            let isPlaying = false;
            let userInteracted = false;
            const musicPlayerDiv = document.getElementById('music-player');
            const toggle = document.getElementById('music-toggle');
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            const loadingIcon = document.getElementById('loading-icon');
            const clickToPlay = document.getElementById('click-to-play');
            const autoplay = ${data.music_autoplay ? 'true' : 'false'};
            
            // Initialize YouTube Player
            window.onYouTubeIframeAPIReady = function() {
              console.log('🎬 YouTube API Ready');
              loadingIcon.style.display = 'none';
              playIcon.style.display = 'block';
              
              player = new YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: '${videoId}',
                playerVars: {
                  autoplay: 1,
                  start: 15,
                  loop: 1,
                  playlist: '${videoId}',
                  controls: 0,
                  disablekb: 1,
                  fs: 0,
                  modestbranding: 1,
                  playsinline: 1
                },
                events: {
                  onReady: function(event) {
                    console.log('🎵 YouTube Player Ready - Starting at 15s');
                    // Seek to 15 seconds and play
                    event.target.seekTo(15, true);
                    event.target.playVideo();
                  },
                  onStateChange: function(event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                      isPlaying = true;
                      playIcon.style.display = 'none';
                      pauseIcon.style.display = 'block';
                      clickToPlay.style.display = 'none';
                      console.log('▶️ Playing');
                      
                      // Hide controls if autoplay is enabled and user hasn't interacted
                      if (autoplay && !userInteracted) {
                        musicPlayerDiv.style.display = 'none';
                      }
                    } else if (event.data === YT.PlayerState.PAUSED) {
                      isPlaying = false;
                      playIcon.style.display = 'block';
                      pauseIcon.style.display = 'none';
                      console.log('⏸️ Paused');
                    } else if (event.data === YT.PlayerState.ENDED) {
                      // Loop manually and start from 15 seconds
                      event.target.seekTo(15, true);
                      event.target.playVideo();
                    }
                  },
                  onError: function(event) {
                    console.error('❌ YouTube Player Error:', event.data);
                    musicPlayerDiv.style.display = 'block';
                    clickToPlay.style.display = 'block';
                    clickToPlay.innerHTML = '❌ Lỗi phát nhạc';
                    clickToPlay.style.background = 'linear-gradient(135deg, #666 0%, #444 100%)';
                  }
                }
              });
            };
            
            // Show loading initially
            if (!window.YT || !window.YT.Player) {
              loadingIcon.style.display = 'block';
              playIcon.style.display = 'none';
            }
            
            // Detect user interaction to show controls if autoplay fails
            let autoplayAttempted = false;
            const detectAutoplayFailure = setTimeout(() => {
              if (!isPlaying && !autoplayAttempted) {
                console.log('⚠️ Autoplay may have failed, showing controls');
                musicPlayerDiv.style.display = 'block';
                clickToPlay.style.display = 'block';
              }
              autoplayAttempted = true;
            }, 3000);
            
            // Toggle button
            toggle.addEventListener('click', function(e) {
              e.stopPropagation();
              userInteracted = true;
              
              if (!player || !player.playVideo) {
                console.log('⏳ Player not ready yet');
                return;
              }
              
              if (isPlaying) {
                player.pauseVideo();
              } else {
                player.seekTo(15, true);
                player.playVideo();
                clickToPlay.style.display = 'none';
              }
            });
            
            // Show controls on any user interaction if autoplay is disabled
            if (!autoplay) {
              musicPlayerDiv.style.display = 'block';
            }
          })();
        </script>
      ` : `
        <!-- MP3 Music Player -->
        <div id="music-player" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: ${data.music_autoplay ? 'none' : 'block'};">
          <audio id="background-music" loop autoplay>
            <source src="${data.music_url}" type="audio/mpeg">
          </audio>
          <button id="music-toggle" style="
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <svg id="play-icon" style="display: block; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg id="pause-icon" style="display: none; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>
          <div id="click-to-play" style="
            position: absolute;
            bottom: 80px;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 30px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            cursor: pointer;
            white-space: nowrap;
            animation: pulse 2s infinite;
            display: none;
          " onclick="document.getElementById('music-toggle').click()">
            🎵 Click để phát nhạc
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }
        </style>
        <script>
          (function() {
            const audio = document.getElementById('background-music');
            const musicPlayerDiv = document.getElementById('music-player');
            const toggle = document.getElementById('music-toggle');
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            const clickToPlay = document.getElementById('click-to-play');
            const autoplay = ${data.music_autoplay ? 'true' : 'false'};
            let userInteracted = false;
            
            // Set start time to 15 seconds
            audio.addEventListener('loadedmetadata', function() {
              audio.currentTime = 15;
              console.log('🎵 Audio start time set to 15 seconds');
            });
            
            // Try autoplay immediately
            setTimeout(() => {
              audio.currentTime = 15;
              audio.play().then(() => {
                console.log('✅ Autoplay success');
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                clickToPlay.style.display = 'none';
                
                // Hide controls if autoplay is enabled and user hasn't interacted
                if (autoplay && !userInteracted) {
                  musicPlayerDiv.style.display = 'none';
                }
              }).catch(err => {
                console.log('⚠️ Autoplay blocked:', err.message);
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                musicPlayerDiv.style.display = 'block';
                clickToPlay.style.display = 'block';
              });
            }, 500);
            
            // Toggle button
            toggle.addEventListener('click', function(e) {
              e.stopPropagation();
              userInteracted = true;
              
              if (audio.paused) {
                audio.currentTime = 15;
                audio.play().then(() => {
                  playIcon.style.display = 'none';
                  pauseIcon.style.display = 'block';
                  clickToPlay.style.display = 'none';
                }).catch(err => {
                  console.error('❌ Failed to play:', err);
                  alert('Không thể phát nhạc. Vui lòng kiểm tra link nhạc.');
                });
              } else {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
              }
            });
            
            // Update icon based on audio state
            audio.addEventListener('play', function() {
              playIcon.style.display = 'none';
              pauseIcon.style.display = 'block';
              clickToPlay.style.display = 'none';
            });
            
            audio.addEventListener('pause', function() {
              playIcon.style.display = 'block';
              pauseIcon.style.display = 'none';
            });
            
            audio.addEventListener('error', function(e) {
              console.error('❌ Audio error:', e);
              musicPlayerDiv.style.display = 'block';
              clickToPlay.style.display = 'block';
              clickToPlay.innerHTML = '❌ Lỗi phát nhạc';
              clickToPlay.style.background = 'linear-gradient(135deg, #666 0%, #444 100%)';
            });
            
            // Show controls on any user interaction if autoplay is disabled
            if (!autoplay) {
              musicPlayerDiv.style.display = 'block';
            }
          })();
        </script>
      `

      // Inject before closing body tag
      html = html.replace('</body>', `${musicPlayer}</body>`)
    }

    console.log('📝 Final HTML length:', html.length)

    // Replace entire document with the HTML template
    // This is necessary because templates have their own <html>, <head>, <body> structure
    setTimeout(() => {
      document.open()
      document.write(html)
      document.close()
      console.log('✅ HTML template rendered as full document')
    }, 100)
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Đang tải thiệp mời...</p>
        </div>
      </div>
    )
  }

  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-3xl">lock</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thiệp Mời Được Bảo Vệ
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Vui lòng nhập mật khẩu để xem thiệp mời
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Không Tìm Thấy Thiệp Mời
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error}
          </p>
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

  if (!invitation) return null

  // If this is an HTML template, let renderHtmlTemplate handle the full document
  if (invitation.html_content) {
    // Return a minimal loading state while document.write() takes over
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-lg">Đang tải thiệp mời...</p>
        </div>
      </div>
    )
  }

  const { design_data, groom_name, bride_name, event_date, event_location } = invitation
  const { elements = [], canvas = {} } = design_data || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">favorite</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                {groom_name} & {bride_name}
              </h1>
              {event_date && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(event_date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              In
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Thiệp cưới ${groom_name} & ${bride_name}`,
                    url: window.location.href
                  })
                }
              }}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              Chia sẻ
            </button>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <main className="py-12 px-4 overflow-hidden min-h-screen flex items-start justify-center">
        <div
          className="relative transition-transform origin-top duration-300 ease-out"
          style={{
            transform: `scale(${Math.min(1, (window.innerWidth - 32) / (canvas.width || 450))})`,
            width: `${canvas.width || 450}px`,
            minHeight: `${canvas.height || 630}px`,
            height: `${canvas.height || 630}px`, // Explicit height to maintain aspect ratio
            marginBottom: `${((canvas.height || 630) * Math.min(1, (window.innerWidth - 32) / (canvas.width || 450))) - (canvas.height || 630)}px` // Negative margin to reduce white space caused by scaling
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: canvas.background || '#ffffff',
              backgroundImage: canvas.backgroundImage ? `url(${canvas.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="shadow-2xl relative rounded-lg overflow-hidden"
          >
            {elements.map(element => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={false}
                onSelect={() => { }}
                onUpdate={() => { }}
                onDelete={() => { }}
                onDuplicate={() => { }}
                onBringForward={() => { }}
                onSendBackward={() => { }}
                onBringToFront={() => { }}
                onSendToBack={() => { }}
                canvasSettings={canvas}
                isPreview={true}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Được tạo bởi <span className="font-bold text-primary">Wedding Invitation Online</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default InvitationViewPage
