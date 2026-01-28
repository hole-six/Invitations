import React, { useState } from 'react'

const BackgroundPanel = ({ canvasSettings, setCanvasSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState('color')

  const solidColors = [
    '#ffffff', '#f5f5f5', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575',
    '#ffebee', '#fce4ec', '#f3e5f5', '#ede7f6', '#e8eaf6', '#e3f2fd',
    '#e1f5fe', '#e0f7fa', '#e0f2f1', '#e8f5e9', '#f1f8e9', '#f9fbe7',
    '#fffde7', '#fff8e1', '#fff3e0', '#fbe9e7', '#efebe9', '#eceff1',
    '#ff1744', '#f50057', '#d500f9', '#651fff', '#3d5afe', '#2979ff',
    '#00b0ff', '#00e5ff', '#1de9b6', '#00e676', '#76ff03', '#c6ff00',
    '#ffea00', '#ffc400', '#ff9100', '#ff3d00', '#dd2c00', '#d50000'
  ]

  const gradients = [
    { id: 1, name: 'Sunset', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 2, name: 'Ocean', gradient: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)' },
    { id: 3, name: 'Pink', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 4, name: 'Green', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 5, name: 'Fire', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 6, name: 'Purple', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  ]

  const patterns = [
    { id: 1, name: 'Dots', url: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="2" cy="2" r="1" fill="%23000" opacity="0.1"/%3E%3C/svg%3E' },
    { id: 2, name: 'Grid', url: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v1H0zM0 0v20h1V0z" fill="%23000" opacity="0.1"/%3E%3C/svg%3E' },
    { id: 3, name: 'Diagonal', url: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 20L20 0" stroke="%23000" opacity="0.1"/%3E%3C/svg%3E' },
  ]

  const handleColorChange = (color) => {
    setCanvasSettings({
      ...canvasSettings,
      background: color,
      backgroundImage: null
    })
  }

  const handleGradientChange = (gradient) => {
    setCanvasSettings({
      ...canvasSettings,
      background: gradient,
      backgroundImage: null
    })
  }

  const handlePatternChange = (pattern) => {
    setCanvasSettings({
      ...canvasSettings,
      backgroundImage: `url(${pattern})`,
      background: '#ffffff'
    })
  }

  const tabs = [
    { id: 'color', label: 'Màu sắc', icon: 'palette' },
    { id: 'gradient', label: 'Gradient', icon: 'gradient' },
    { id: 'pattern', label: 'Họa tiết', icon: 'texture' },
    { id: 'upload', label: 'Tải lên', icon: 'upload' },
    { id: 'stock', label: 'Stock', icon: 'image' }
  ]

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Nền Canvas</h3>
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
      <div className="flex-1 overflow-y-auto p-4">
        {/* Color Tab */}
        {activeTab === 'color' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                Màu tùy chỉnh
              </label>
              <input
                type="color"
                value={canvasSettings.background}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                Màu có sẵn
              </label>
              <div className="grid grid-cols-6 gap-2">
                {solidColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorChange(color)}
                    className={`size-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      canvasSettings.background === color
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gradient Tab */}
        {activeTab === 'gradient' && (
          <div className="space-y-3">
            {gradients.map((grad) => (
              <button
                key={grad.id}
                onClick={() => handleGradientChange(grad.gradient)}
                className="w-full h-20 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105 relative overflow-hidden group"
                style={{ background: grad.gradient }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
                  {grad.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pattern Tab */}
        {activeTab === 'pattern' && (
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handlePatternChange(pattern.url)}
                className="w-full h-20 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105 relative overflow-hidden group"
                style={{
                  backgroundImage: `url(${pattern.url})`,
                  backgroundColor: '#ffffff'
                }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-2 left-2 text-gray-900 text-xs font-semibold bg-white/80 px-2 py-1 rounded">
                  {pattern.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setCanvasSettings({
                        ...canvasSettings,
                        backgroundImage: `url(${event.target.result})`,
                        background: '#ffffff'
                      })
                    }
                    reader.readAsDataURL(file)
                  }
                }
                input.click()
              }}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-blue-600">cloud_upload</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Chọn hình nền cá nhân
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click để tải ảnh lên
                  </p>
                </div>
              </div>
            </div>
            
            {canvasSettings.backgroundImage && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Xem trước
                </label>
                <div 
                  className="w-full h-32 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-cover bg-center"
                  style={{ 
                    backgroundImage: canvasSettings.backgroundImage,
                    backgroundColor: canvasSettings.background 
                  }}
                />
                <button
                  onClick={() => {
                    setCanvasSettings({
                      ...canvasSettings,
                      backgroundImage: null,
                      background: '#ffffff'
                    })
                  }}
                  className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Xóa hình nền
                </button>
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Hỗ trợ: JPG, PNG, GIF, WebP
            </p>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
              <button
                key={i}
                className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105"
                style={{
                  backgroundImage: `url(https://via.placeholder.com/150/random/${i})`,
                  backgroundSize: 'cover'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleColorChange('#ffffff')}
          className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Đặt lại về trắng
        </button>
      </div>
    </div>
  )
}

export default BackgroundPanel
