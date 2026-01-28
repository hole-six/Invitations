import React from 'react'

const AlignmentTools = ({ selectedElements, onAlign, onDistribute }) => {
  if (!selectedElements || selectedElements.length < 2) return null

  const alignments = [
    { id: 'left', icon: 'align_horizontal_left', label: 'Căn trái' },
    { id: 'center', icon: 'align_horizontal_center', label: 'Căn giữa ngang' },
    { id: 'right', icon: 'align_horizontal_right', label: 'Căn phải' },
    { id: 'top', icon: 'align_vertical_top', label: 'Căn trên' },
    { id: 'middle', icon: 'align_vertical_center', label: 'Căn giữa dọc' },
    { id: 'bottom', icon: 'align_vertical_bottom', label: 'Căn dưới' }
  ]

  const distributions = [
    { id: 'horizontal', icon: 'distribute', label: 'Phân bố ngang' },
    { id: 'vertical', icon: 'vertical_distribute', label: 'Phân bố dọc' }
  ]

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1 z-50">
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
        {alignments.map(align => (
          <button
            key={align.id}
            onClick={() => onAlign(align.id)}
            className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={align.label}
          >
            <span className="material-symbols-outlined text-[20px]">{align.icon}</span>
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-1">
        {distributions.map(dist => (
          <button
            key={dist.id}
            onClick={() => onDistribute(dist.id)}
            className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={dist.label}
          >
            <span className="material-symbols-outlined text-[20px]">{dist.icon}</span>
          </button>
        ))}
      </div>

      <div className="pl-2 border-l border-gray-300 dark:border-gray-600">
        <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
          {selectedElements.length} đã chọn
        </span>
      </div>
    </div>
  )
}

export default AlignmentTools
