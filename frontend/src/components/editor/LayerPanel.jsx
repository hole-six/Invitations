import React from 'react'

const LayerPanel = ({ elements, selectedElement, onSelect, onDelete, onToggleVisibility, onMoveLayer }) => {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Lớp ({elements.length})</h3>
        <button className="text-xs text-primary hover:underline">Xóa tất cả</button>
      </div>

      {elements.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          Chưa có phần tử nào
        </div>
      ) : (
        <div className="space-y-1">
          {[...elements].reverse().map((element, index) => (
            <div
              key={element.id}
              onClick={() => onSelect(element)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedElement?.id === element.id
                  ? 'bg-primary/10 border-l-2 border-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility(element.id)
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {element.visible !== false ? 'visibility' : 'visibility_off'}
                </span>
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-gray-400">
                    {element.type === 'text' ? 'title' : element.type === 'image' ? 'image' : 'category'}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {element.type === 'text' 
                      ? element.content?.substring(0, 20) || 'Text' 
                      : element.type === 'image' 
                      ? 'Image' 
                      : 'Shape'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveLayer(element.id, 'up')
                  }}
                  className="size-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Lên trên"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveLayer(element.id, 'down')
                  }}
                  className="size-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Xuống dưới"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(element.id)
                  }}
                  className="size-6 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LayerPanel
