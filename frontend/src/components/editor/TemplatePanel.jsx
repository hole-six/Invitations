import React, { useState } from 'react'

const TemplatePanel = ({ onClose, onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const templates = [
    { id: 1, name: 'Thiệp Mời Cổ Điển', type: 'basic', image: 'https://via.placeholder.com/300x400/e91e63/ffffff?text=Template+1' },
    { id: 2, name: 'Khung Yêu & Tình', type: 'basic', image: 'https://via.placeholder.com/300x400/9c27b0/ffffff?text=Template+2' },
    { id: 3, name: 'Tuấn Minh & Mai Trang', type: 'premium', image: 'https://via.placeholder.com/300x400/3f51b5/ffffff?text=Template+3' },
    { id: 4, name: 'Thiệp Cưới Hiện Đại', type: 'basic', image: 'https://via.placeholder.com/300x400/2196f3/ffffff?text=Template+4' },
    { id: 5, name: 'Save Our Date', type: 'basic', image: 'https://via.placeholder.com/300x400/00bcd4/ffffff?text=Template+5' },
    { id: 6, name: 'Thiệp Yêu & Hạnh Phúc', type: 'basic', image: 'https://via.placeholder.com/300x400/009688/ffffff?text=Template+6' },
  ]

  const categories = [
    'Tất cả', 'Yêu tổ đám cưới', 'Nhân vật', 'Hoa cưới', 'Chữ ký', 'Trái tim',
    'Xem thêm ▼', 'Kết hợp chữ', 'Số và chữ cái', 'Trang trí không gian',
    'Chúc mừng sinh nhật', 'Mặt trời', 'Lễ hội nổi bật', 'Ngôi sao',
    'Mẹ và bé', 'Biểu tượng lưu đồ', 'Bản đồ', 'Hình dạng',
    'Khung viền', 'Đường phân cách'
  ]

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Chọn mẫu thiết kế</h3>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Chọn một mẫu thiết kế có sẵn để bắt đầu nhanh chóng
        </p>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                index === 0
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate && onSelectTemplate(template.id)}
              className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105 group"
            >
              <img
                src={template.image}
                alt={template.name}
                className="w-full aspect-[3/4] object-cover"
              />
              {template.type === 'premium' && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                  PREMIUM
                </div>
              )}
              {template.type === 'basic' && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                  BASIC
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs font-medium text-white truncate">{template.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplatePanel
