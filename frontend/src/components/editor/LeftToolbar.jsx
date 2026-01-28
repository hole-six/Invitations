import React from 'react'

const LeftToolbar = ({ activeTab, setActiveTab, onAddText }) => {
  const tools = [
    { id: 'text', icon: 'title', label: 'Văn bản', action: onAddText },
    { id: 'image', icon: 'image', label: 'Hình ảnh' },
    { id: 'sticker', icon: 'emoji_emotions', label: 'Stock' },
    { id: 'background', icon: 'wallpaper', label: 'Nền' },
    { id: 'music', icon: 'music_note', label: 'Âm nhạc' },
    { id: 'template', icon: 'dashboard', label: 'Tiện ích' },
    { id: 'effects', icon: 'auto_fix_high', label: 'Hiệu ứng' },
  ]

  return (
    <aside className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4 overflow-y-auto shrink-0 z-10">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => {
            setActiveTab(tool.id)
            if (tool.action) tool.action()
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer group ${
            activeTab === tool.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className={`size-10 flex items-center justify-center rounded-lg transition-colors ${
            activeTab === tool.id 
              ? 'bg-primary/10 text-primary' 
              : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
          }`}>
            <span className="material-symbols-outlined">{tool.icon}</span>
          </div>
          <span className="text-[10px] font-medium">{tool.label}</span>
        </button>
      ))}

      <div className="flex-1"></div>

      <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <div className="size-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </div>
        <span className="text-[10px] font-medium">Cài đặt</span>
      </button>
    </aside>
  )
}

export default LeftToolbar
