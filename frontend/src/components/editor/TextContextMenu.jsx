import React, { useEffect, useRef } from 'react'

const TextContextMenu = ({ position, onClose, onAction, element }) => {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuItems = [
    {
      id: 'font',
      label: 'Kiểu chữ',
      icon: 'text_fields',
      action: 'font'
    },
    {
      id: 'spacing',
      label: 'Khoảng đệm',
      icon: 'format_line_spacing',
      action: 'spacing'
    },
    {
      id: 'outline',
      label: 'Đường viền',
      icon: 'border_style',
      action: 'outline'
    },
    {
      id: 'shadow',
      label: 'Đổ bóng',
      icon: 'shadow',
      action: 'shadow'
    },
    {
      id: 'link',
      label: 'Liên kết',
      icon: 'link',
      action: 'link'
    },
    {
      id: 'animation',
      label: 'Hiệu ứng chuyển động',
      icon: 'animation',
      action: 'animation'
    },
    {
      id: 'transition',
      label: 'Chuyển động liên tục',
      icon: 'motion_photos_on',
      action: 'transition'
    }
  ]

  const handleItemClick = (action) => {
    onAction(action)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999] min-w-[280px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <span className="material-symbols-outlined text-[20px]">edit</span>
          <span className="font-semibold">Tùy chỉnh</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
          Kích đúp vào văn bản để chỉnh sửa
        </p>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.action)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-600 dark:text-gray-400 group-hover:text-primary">
              {item.icon}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary">
              {item.label}
            </span>
            <span className="material-symbols-outlined text-[16px] text-gray-400 ml-auto">
              chevron_right
            </span>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 mt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onAction('duplicate')
              onClose()
            }}
            className="flex-1 px-3 py-2 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            Nhân bản
          </button>
          <button
            onClick={() => {
              onAction('delete')
              onClose()
            }}
            className="flex-1 px-3 py-2 text-xs font-medium rounded bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

export default TextContextMenu
