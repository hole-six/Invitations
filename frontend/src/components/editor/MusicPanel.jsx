import React, { useState } from 'react'

const MusicPanel = ({ formData, setFormData, onClose, onAddMusic }) => {
  const [activeTab, setActiveTab] = useState('library')
  const [searchQuery, setSearchQuery] = useState('')

  const musicLibrary = [
    { id: 1, title: '50 Năm Về Sau', artist: 'Sơn Tùng M-TP', duration: '03:54', category: 'vpop' },
    { id: 2, title: 'A Little Love', artist: 'Fiona Fung', duration: '03:11', category: 'foreign' },
    { id: 3, title: 'A Thousand Years', artist: 'Christina Perri', duration: '04:48', category: 'foreign' },
    { id: 4, title: 'All of Me', artist: 'John Legend', duration: '04:30', category: 'foreign' },
    { id: 5, title: 'Always', artist: 'Bon Jovi', duration: '03:25', category: 'foreign' },
    { id: 6, title: 'Ánh Nắng Của Anh', artist: 'Đức Phúc', duration: '04:24', category: 'vpop' },
  ]

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'foreign', label: 'Nhạc ngoại' },
    { id: 'vpop', label: 'V-POP' },
  ]

  const tabs = [
    { id: 'library', label: 'Thư viện nhạc', icon: 'library_music' },
    { id: 'upload', label: 'Nhạc của tôi', icon: 'upload_file' }
  ]

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Âm nhạc</h3>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'library' && (
          <div>
            {/* Current Music */}
            {formData.music_url && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Nhạc hiện tại</p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">music_note</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {formData.music_title || 'Bài Này Không Để Đi Diễn'}
                    </p>
                    <p className="text-xs text-gray-500">{formData.music_artist || 'Unknown'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        music_url: '',
                        music_title: '',
                        music_artist: ''
                      })
                    }}
                    className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài hát"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  search
                </span>
              </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-white"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Music List */}
            <div className="p-4 space-y-2">
              {musicLibrary.map((music) => (
                <div
                  key={music.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                >
                  <button className="size-10 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {music.title}
                    </p>
                    <p className="text-xs text-gray-500">{music.artist} • {music.duration}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (onAddMusic) {
                        onAddMusic({
                          title: music.title,
                          artist: music.artist,
                          duration: music.duration,
                          url: `https://example.com/music/${music.id}.mp3` // Placeholder URL
                        })
                      }
                      setFormData({ 
                        ...formData, 
                        music_url: `https://example.com/music/${music.id}.mp3`,
                        music_title: music.title,
                        music_artist: music.artist
                      })
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    Sử dụng
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="p-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-blue-600">cloud_upload</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Tải nhạc của bạn lên
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hỗ trợ MP3, WAV (tối đa 10MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-yellow-600 text-[18px] mt-0.5">info</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Lưu ý: Chỉ sử dụng nhạc có bản quyền hoặc nhạc bạn sở hữu
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.music_autoplay || false}
            onChange={(e) => setFormData({ ...formData, music_autoplay: e.target.checked })}
            className="w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Tự động phát khi mở thiệp
          </span>
        </label>
      </div>
    </div>
  )
}

export default MusicPanel
