import React, { useState } from 'react'

const StockPanel = ({ onAddImage, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', label: 'Tất cả', icon: 'grid_view' },
    { id: 'wedding', label: 'Cưới hỏi', icon: 'favorite' },
    { id: 'flowers', label: 'Hoa lá', icon: 'local_florist' },
    { id: 'decorations', label: 'Trang trí', icon: 'celebration' },
    { id: 'backgrounds', label: 'Nền', icon: 'wallpaper' },
    { id: 'patterns', label: 'Họa tiết', icon: 'texture' }
  ]

  // Mock stock images - replace with real API
  const stockImages = [
    { id: 1, url: 'https://via.placeholder.com/300x200/e91e63/ffffff?text=Wedding+1', category: 'wedding', free: true },
    { id: 2, url: 'https://via.placeholder.com/300x200/9c27b0/ffffff?text=Flowers+1', category: 'flowers', free: true },
    { id: 3, url: 'https://via.placeholder.com/300x200/3f51b5/ffffff?text=Decoration+1', category: 'decorations', free: false },
    { id: 4, url: 'https://via.placeholder.com/300x200/2196f3/ffffff?text=Background+1', category: 'backgrounds', free: true },
    { id: 5, url: 'https://via.placeholder.com/300x200/00bcd4/ffffff?text=Pattern+1', category: 'patterns', free: false },
    { id: 6, url: 'https://via.placeholder.com/300x200/009688/ffffff?text=Wedding+2', category: 'wedding', free: true },
  ]

  const filteredImages = stockImages.filter(img => 
    (activeCategory === 'all' || img.category === activeCategory) &&
    (searchQuery === '' || img.category.includes(searchQuery.toLowerCase()))
  )

  const handleImageClick = (image) => {
    // Convert URL to File and add to canvas
    fetch(image.url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `stock-${image.id}.jpg`, { type: 'image/jpeg' })
        onAddImage(file)
      })
  }

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Stock Photos</h3>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm ảnh..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Images Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredImages.map(image => (
            <div
              key={image.id}
              onClick={() => handleImageClick(image)}
              className="relative aspect-[3/2] rounded-lg overflow-hidden cursor-pointer group"
            >
              <img
                src={image.url}
                alt={`Stock ${image.id}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              
              {/* Free Badge */}
              {image.free && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                  Free
                </div>
              )}
              
              {/* Add Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-primary">add</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-gray-400 mb-2">
              image_not_supported
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Không tìm thấy ảnh nào
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Powered by Unsplash & Pexels</span>
        </div>
      </div>
    </div>
  )
}

export default StockPanel
