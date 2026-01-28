import React from 'react'

const UtilitiesPanel = ({ onClose, onAddUtility }) => {
  const utilities = [
    { id: 'calendar', icon: 'event', label: 'Lịch', color: 'bg-red-100 text-red-600', premium: false },
    { id: 'countdown', icon: 'timer', label: 'Đếm ngược', color: 'bg-blue-100 text-blue-600', premium: false },
    { id: 'map', icon: 'location_on', label: 'Bản đồ', color: 'bg-green-100 text-green-600', premium: false },
    { id: 'phone', icon: 'call', label: 'Nút gọi', color: 'bg-purple-100 text-purple-600', premium: false },
    { id: 'form', icon: 'assignment', label: 'Form xác nhận tham dự', color: 'bg-orange-100 text-orange-600', premium: false },
    { id: 'guestlist', icon: 'badge', label: 'Tên khách mời tự động', color: 'bg-pink-100 text-pink-600', premium: true },
    { id: 'qrbox', icon: 'card_giftcard', label: 'QR Box', color: 'bg-yellow-100 text-yellow-600', premium: true },
    { id: 'envelope', icon: 'mail', label: 'Hiệu ứng phong bì thư', color: 'bg-red-100 text-red-600', premium: true },
    { id: 'album', icon: 'photo_library', label: 'Album ảnh', color: 'bg-indigo-100 text-indigo-600', premium: true },
    { id: 'video', icon: 'video_library', label: 'Video YouTube', color: 'bg-red-100 text-red-600', premium: true },
  ]

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tiện ích</h3>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {utilities.map((utility) => (
            <button
              key={utility.id}
              onClick={() => onAddUtility && onAddUtility(utility.id)}
              className="relative p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105 group"
            >
              {utility.premium && (
                <div className="absolute top-2 right-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">workspace_premium</span>
                </div>
              )}
              <div className={`size-12 rounded-lg ${utility.color} flex items-center justify-center mx-auto mb-2`}>
                <span className="material-symbols-outlined text-[24px]">{utility.icon}</span>
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                {utility.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UtilitiesPanel
