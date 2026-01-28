import React from 'react'

const ShapeLibrary = ({ onAddShape }) => {
  const shapes = [
    { type: 'rectangle', icon: '⬜', label: 'Hình chữ nhật' },
    { type: 'circle', icon: '⭕', label: 'Hình tròn' },
    { type: 'triangle', icon: '🔺', label: 'Tam giác' },
    { type: 'star', icon: '⭐', label: 'Ngôi sao' },
    { type: 'heart', icon: '❤️', label: 'Trái tim' },
    { type: 'line', icon: '➖', label: 'Đường thẳng' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {shapes.map((shape) => (
        <button
          key={shape.type}
          onClick={() => onAddShape(shape.type)}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">{shape.icon}</span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{shape.label}</span>
        </button>
      ))}
    </div>
  )
}

export default ShapeLibrary
