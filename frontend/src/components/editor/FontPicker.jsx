import React from 'react'

const FontPicker = ({ value, onChange }) => {
  const fonts = [
    { name: 'Arial', family: 'Arial, sans-serif' },
    { name: 'Times New Roman', family: '"Times New Roman", serif' },
    { name: 'Georgia', family: 'Georgia, serif' },
    { name: 'Courier New', family: '"Courier New", monospace' },
    { name: 'Verdana', family: 'Verdana, sans-serif' },
    { name: 'Helvetica', family: 'Helvetica, sans-serif' },
    { name: 'Palatino', family: 'Palatino, serif' },
    { name: 'Garamond', family: 'Garamond, serif' },
    { name: 'Comic Sans MS', family: '"Comic Sans MS", cursive' },
    { name: 'Impact', family: 'Impact, fantasy' },
  ]

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-500 uppercase">Phông chữ</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        {fonts.map((font) => (
          <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>
            {font.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FontPicker
