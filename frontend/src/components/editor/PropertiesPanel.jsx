import React, { useState } from 'react'
import FontPicker from './FontPicker'
import TextEffectsPanel from './TextEffectsPanel'

const PropertiesPanel = ({ 
  selectedElement, 
  updateElement, 
  deleteElement, 
  moveLayer,
  formData,
  setFormData,
  canvasSettings,
  setCanvasSettings
}) => {
  if (!selectedElement) {
    return (
      <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0 z-10 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-900 dark:text-white text-sm font-bold">Thông tin thiệp</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
              placeholder="Thiệp cưới của chúng tôi"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Chú rể</label>
              <input
                type="text"
                value={formData.groom_name}
                onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                placeholder="Tên chú rể"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cô dâu</label>
              <input
                type="text"
                value={formData.bride_name}
                onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                placeholder="Tên cô dâu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Ngày cưới</label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Địa điểm</label>
            <input
              type="text"
              value={formData.event_location}
              onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
              placeholder="Tên địa điểm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Địa chỉ</label>
            <textarea
              value={formData.event_address}
              onChange={(e) => setFormData({ ...formData, event_address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
              rows="2"
              placeholder="Địa chỉ chi tiết"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nhạc nền</label>
            <input
              type="url"
              value={formData.music_url}
              onChange={(e) => setFormData({ ...formData, music_url: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
              placeholder="URL nhạc nền"
            />
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={formData.music_autoplay}
                onChange={(e) => setFormData({ ...formData, music_autoplay: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">Tự động phát</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Cài đặt canvas</h4>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Màu nền</label>
              <input
                type="color"
                value={canvasSettings.background}
                onChange={(e) => setCanvasSettings({ ...canvasSettings, background: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0 z-10 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-gray-900 dark:text-white text-sm font-bold">Thuộc tính</h3>
        <button
          onClick={() => deleteElement(selectedElement.id)}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Xóa
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nội dung</label>
              <textarea
                value={selectedElement.content}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Phông chữ</label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                style={{ fontFamily: selectedElement.fontFamily }}
              >
                <optgroup label="Sans Serif">
                  <option value="Arial" style={{ fontFamily: 'Arial' }}>Arial</option>
                  <option value="Helvetica" style={{ fontFamily: 'Helvetica' }}>Helvetica</option>
                  <option value="Verdana" style={{ fontFamily: 'Verdana' }}>Verdana</option>
                  <option value="'Roboto', sans-serif" style={{ fontFamily: 'Roboto' }}>Roboto</option>
                  <option value="'Open Sans', sans-serif" style={{ fontFamily: 'Open Sans' }}>Open Sans</option>
                  <option value="'Lato', sans-serif" style={{ fontFamily: 'Lato' }}>Lato</option>
                  <option value="'Montserrat', sans-serif" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                  <option value="'Poppins', sans-serif" style={{ fontFamily: 'Poppins' }}>Poppins</option>
                  <option value="'Raleway', sans-serif" style={{ fontFamily: 'Raleway' }}>Raleway</option>
                  <option value="'Nunito', sans-serif" style={{ fontFamily: 'Nunito' }}>Nunito</option>
                </optgroup>
                <optgroup label="Serif">
                  <option value="'Times New Roman'" style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
                  <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
                  <option value="'Playfair Display', serif" style={{ fontFamily: 'Playfair Display' }}>Playfair Display</option>
                  <option value="'Merriweather', serif" style={{ fontFamily: 'Merriweather' }}>Merriweather</option>
                  <option value="'Lora', serif" style={{ fontFamily: 'Lora' }}>Lora</option>
                  <option value="'Crimson Text', serif" style={{ fontFamily: 'Crimson Text' }}>Crimson Text</option>
                </optgroup>
                <optgroup label="Handwriting">
                  <option value="'Dancing Script', cursive" style={{ fontFamily: 'Dancing Script' }}>Dancing Script</option>
                  <option value="'Pacifico', cursive" style={{ fontFamily: 'Pacifico' }}>Pacifico</option>
                  <option value="'Great Vibes', cursive" style={{ fontFamily: 'Great Vibes' }}>Great Vibes</option>
                  <option value="'Satisfy', cursive" style={{ fontFamily: 'Satisfy' }}>Satisfy</option>
                  <option value="'Allura', cursive" style={{ fontFamily: 'Allura' }}>Allura</option>
                  <option value="'Sacramento', cursive" style={{ fontFamily: 'Sacramento' }}>Sacramento</option>
                </optgroup>
                <optgroup label="Display">
                  <option value="'Bebas Neue', cursive" style={{ fontFamily: 'Bebas Neue' }}>Bebas Neue</option>
                  <option value="'Righteous', cursive" style={{ fontFamily: 'Righteous' }}>Righteous</option>
                  <option value="'Lobster', cursive" style={{ fontFamily: 'Lobster' }}>Lobster</option>
                  <option value="'Oswald', sans-serif" style={{ fontFamily: 'Oswald' }}>Oswald</option>
                </optgroup>
                <optgroup label="Monospace">
                  <option value="'Courier New'" style={{ fontFamily: 'Courier New' }}>Courier New</option>
                  <option value="'Roboto Mono', monospace" style={{ fontFamily: 'Roboto Mono' }}>Roboto Mono</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cỡ chữ</label>
                <input
                  type="number"
                  value={selectedElement.fontSize}
                  onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                  min="8"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Màu chữ</label>
                <input
                  type="color"
                  value={selectedElement.color}
                  onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateElement(selectedElement.id, { 
                  fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold ${
                  selectedElement.fontWeight === 'bold' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                B
              </button>
              <button
                onClick={() => updateElement(selectedElement.id, { 
                  fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm italic ${
                  selectedElement.fontStyle === 'italic' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                I
              </button>
              <button
                onClick={() => updateElement(selectedElement.id, { 
                  textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
                })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm underline ${
                  selectedElement.textDecoration === 'underline' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                U
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Căn chỉnh</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}
                  className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center ${
                    selectedElement.textAlign === 'left' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  title="Căn trái"
                >
                  <span className="material-symbols-outlined text-[20px]">format_align_left</span>
                </button>
                <button
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}
                  className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center ${
                    selectedElement.textAlign === 'center' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  title="Căn giữa"
                >
                  <span className="material-symbols-outlined text-[20px]">format_align_center</span>
                </button>
                <button
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}
                  className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center ${
                    selectedElement.textAlign === 'right' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  title="Căn phải"
                >
                  <span className="material-symbols-outlined text-[20px]">format_align_right</span>
                </button>
                <button
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'justify' })}
                  className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center ${
                    selectedElement.textAlign === 'justify' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  title="Căn đều"
                >
                  <span className="material-symbols-outlined text-[20px]">format_align_justify</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Music Properties */}
        {selectedElement.type === 'music' && (
          <>
            {/* Music Info */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">music_note</span>
                Thông tin nhạc
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedElement.title || 'Tên bài hát'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {selectedElement.artist || 'Nghệ sĩ'}
              </p>
            </div>

            {/* Icon Selection with 3D Preview */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                Chọn biểu tượng (12 icon 3D)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: 'music_note', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                  { icon: 'library_music', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                  { icon: 'album', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                  { icon: 'headphones', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                  { icon: 'speaker', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
                  { icon: 'volume_up', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
                  { icon: 'radio', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
                  { icon: 'piano', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
                  { icon: 'graphic_eq', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
                  { icon: 'audiotrack', gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)' },
                  { icon: 'queue_music', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
                  { icon: 'mic', gradient: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)' }
                ].map(({ icon, gradient }) => (
                  <button
                    key={icon}
                    onClick={() => updateElement(selectedElement.id, { icon, backgroundColor: gradient })}
                    className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all hover:scale-110 hover:shadow-lg relative overflow-hidden ${
                      selectedElement.icon === icon
                        ? 'border-primary ring-2 ring-primary/30 scale-105'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{
                      background: gradient,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
                    }}
                  >
                    {/* Shine effect */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)'
                      }}
                    />
                    <span className="material-symbols-outlined text-white text-[20px] relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                      {icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Presets */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                Gradient đẹp (20+ màu)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
                  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                  'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
                  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
                  'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
                  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                ].map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => updateElement(selectedElement.id, { backgroundColor: gradient })}
                    className="aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-110 hover:shadow-lg"
                    style={{
                      background: gradient,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Color */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Màu icon
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.iconColor || '#ffffff'}
                  onChange={(e) => updateElement(selectedElement.id, { iconColor: e.target.value })}
                  className="flex-1 h-10 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => updateElement(selectedElement.id, { iconColor: '#ffffff' })}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
                >
                  Trắng
                </button>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Bo góc: {selectedElement.borderRadius || 30}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={selectedElement.borderRadius || 30}
                onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateElement(selectedElement.id, { borderRadius: 0 })}
                  className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
                >
                  ▢ Vuông
                </button>
                <button
                  onClick={() => updateElement(selectedElement.id, { borderRadius: 12 })}
                  className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
                >
                  ▢ Bo nhẹ
                </button>
                <button
                  onClick={() => updateElement(selectedElement.id, { borderRadius: 30 })}
                  className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
                >
                  ● Tròn
                </button>
              </div>
            </div>
          </>
        )}

        {/* Image Properties */}
        {selectedElement.type === 'image' && (
          <>
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video">
              <img
                src={selectedElement.url}
                alt="Preview"
                className="w-full h-full object-contain"
                style={{
                  filter: selectedElement.filter || 'none',
                  transform: `scaleX(${selectedElement.flipX ? -1 : 1}) scaleY(${selectedElement.flipY ? -1 : 1})`
                }}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // TODO: Implement crop functionality
                  alert('Tính năng cắt ảnh đang phát triển')
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">crop</span>
                Cắt ảnh
              </button>
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        updateElement(selectedElement.id, { url: event.target.result })
                      }
                      reader.readAsDataURL(file)
                    }
                  }
                  input.click()
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                Đổi ảnh
              </button>
            </div>

            <button
              onClick={() => {
                alert('Tính năng xóa nền AI đang phát triển')
              }}
              className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
              Xóa nền (AI)
            </button>

            {/* Màu sắc */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Màu sắc</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Độ trong suốt: {Math.round((selectedElement.opacity || 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.opacity || 1}
                    onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Bộ lọc</label>
                  <select
                    value={selectedElement.filter || 'none'}
                    onChange={(e) => updateElement(selectedElement.id, { filter: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                  >
                    <option value="none">Không có</option>
                    <option value="grayscale(100%)">Đen trắng</option>
                    <option value="sepia(100%)">Sepia</option>
                    <option value="blur(5px)">Mờ</option>
                    <option value="brightness(150%)">Sáng hơn</option>
                    <option value="brightness(50%)">Tối hơn</option>
                    <option value="contrast(150%)">Tương phản cao</option>
                    <option value="saturate(200%)">Bão hòa</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateElement(selectedElement.id, { flipX: !selectedElement.flipX })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedElement.flipX ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">flip</span>
                    Lật ngang
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { flipY: !selectedElement.flipY })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      selectedElement.flipY ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] rotate-90">flip</span>
                    Lật dọc
                  </button>
                </div>
              </div>
            </details>

            {/* Khoảng đệm */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Khoảng đệm</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Padding: {selectedElement.padding || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedElement.padding || 0}
                    onChange={(e) => updateElement(selectedElement.id, { padding: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </details>

            {/* Đường viền */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Đường viền</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Độ dày: {selectedElement.borderWidth || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={selectedElement.borderWidth || 0}
                    onChange={(e) => updateElement(selectedElement.id, { borderWidth: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Màu viền</label>
                  <input
                    type="color"
                    value={selectedElement.borderColor || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Bo góc: {selectedElement.borderRadius || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedElement.borderRadius || 0}
                    onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </details>

            {/* Đổ bóng */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Đổ bóng</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bật đổ bóng</label>
                  <input
                    type="checkbox"
                    checked={selectedElement.shadow?.enabled || false}
                    onChange={(e) => updateElement(selectedElement.id, {
                      shadow: { 
                        enabled: e.target.checked,
                        offsetX: 4,
                        offsetY: 4,
                        blur: 8,
                        color: '#000000',
                        opacity: 0.3,
                        ...selectedElement.shadow
                      }
                    })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                </div>
                {selectedElement.shadow?.enabled && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Độ lệch X: {selectedElement.shadow?.offsetX || 4}px
                      </label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={selectedElement.shadow?.offsetX || 4}
                        onChange={(e) => updateElement(selectedElement.id, {
                          shadow: { ...selectedElement.shadow, offsetX: parseInt(e.target.value) }
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Độ lệch Y: {selectedElement.shadow?.offsetY || 4}px
                      </label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={selectedElement.shadow?.offsetY || 4}
                        onChange={(e) => updateElement(selectedElement.id, {
                          shadow: { ...selectedElement.shadow, offsetY: parseInt(e.target.value) }
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Độ mờ: {selectedElement.shadow?.blur || 8}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={selectedElement.shadow?.blur || 8}
                        onChange={(e) => updateElement(selectedElement.id, {
                          shadow: { ...selectedElement.shadow, blur: parseInt(e.target.value) }
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Màu bóng</label>
                      <input
                        type="color"
                        value={selectedElement.shadow?.color || '#000000'}
                        onChange={(e) => updateElement(selectedElement.id, {
                          shadow: { ...selectedElement.shadow, color: e.target.value }
                        })}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            </details>

            {/* Liên kết */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Liên kết</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-3">
                <input
                  type="url"
                  value={selectedElement.link || ''}
                  onChange={(e) => updateElement(selectedElement.id, { link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click vào ảnh sẽ mở link này
                </p>
              </div>
            </details>

            {/* Hiệu ứng chuyển động */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Hiệu ứng chuyển động</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-2">
                <select
                  value={selectedElement.animation || 'none'}
                  onChange={(e) => updateElement(selectedElement.id, { animation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                >
                  <option value="none">Không có</option>
                  <option value="fadeIn">Fade In</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="slideDown">Slide Down</option>
                  <option value="slideLeft">Slide Left</option>
                  <option value="slideRight">Slide Right</option>
                  <option value="scaleIn">Scale In</option>
                  <option value="rotateIn">Rotate In</option>
                </select>
                {selectedElement.animation && selectedElement.animation !== 'none' && (
                  <button
                    onClick={() => {
                      // Trigger demo by removing and re-adding the animate-demo class
                      const element = document.querySelector(`[data-element-id="${selectedElement.id}"]`)
                      if (element) {
                        element.classList.remove('animate-demo')
                        // Force reflow
                        void element.offsetWidth
                        element.classList.add('animate-demo')
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Xem Demo
                  </button>
                )}
              </div>
            </details>

            {/* Chuyển động liên tục */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Chuyển động liên tục</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-2">
                <select
                  value={selectedElement.continuousAnimation || 'none'}
                  onChange={(e) => updateElement(selectedElement.id, { continuousAnimation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                >
                  <option value="none">Không có</option>
                  <option value="pulse">Pulse (Nhấp nháy)</option>
                  <option value="bounce">Bounce (Nảy)</option>
                  <option value="shake">Shake (Rung)</option>
                  <option value="rotate">Rotate (Xoay)</option>
                  <option value="float">Float (Lơ lửng)</option>
                </select>
                {selectedElement.continuousAnimation && selectedElement.continuousAnimation !== 'none' && (
                  <button
                    onClick={() => {
                      // Trigger demo by toggling animation temporarily
                      const element = document.querySelector(`[data-element-id="${selectedElement.id}"]`)
                      if (element) {
                        const currentAnim = element.style.animation
                        element.style.animation = 'none'
                        setTimeout(() => {
                          element.style.animation = currentAnim
                        }, 10)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Xem Demo
                  </button>
                )}
              </div>
            </details>
            {/* Text Effects */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Hiệu ứng chữ</h4>
              <TextEffectsPanel 
                element={selectedElement}
                updateElement={updateElement}
              />
            </div>
          </>
        )}

        {/* Text Effects */}
        {selectedElement.type === 'text' && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Hiệu ứng chữ</h4>
            <TextEffectsPanel 
              element={selectedElement}
              updateElement={updateElement}
            />
          </div>
        )}

        {/* Common Properties */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Vị trí & Kích thước</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
              />
            </div>
          </div>

          {(selectedElement.type === 'image' || selectedElement.type === 'shape') && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Rộng</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cao</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Xoay ({selectedElement.rotation || 0}°)</label>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedElement.rotation || 0}
              onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Độ mờ ({Math.round((selectedElement.opacity || 1) * 100)}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={(selectedElement.opacity || 1) * 100}
              onChange={(e) => updateElement(selectedElement.id, { opacity: parseInt(e.target.value) / 100 })}
              className="w-full"
            />
          </div>
        </div>

        {/* Layer Controls */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Lớp</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => moveLayer(selectedElement.id, 'up')}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              Lên trên
            </button>
            <button
              onClick={() => moveLayer(selectedElement.id, 'down')}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              Xuống dưới
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => moveLayer(selectedElement.id, 'top')}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">vertical_align_top</span>
              Lên đầu
            </button>
            <button
              onClick={() => moveLayer(selectedElement.id, 'bottom')}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">vertical_align_bottom</span>
              Xuống cuối
            </button>
          </div>
        </div>

        {/* Animation Effects - Only for Text */}
        {selectedElement.type === 'text' && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Hiệu ứng động</h4>
            
            {/* Entry Animation */}
            <details className="group mb-3">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Hiệu ứng chuyển động</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-2">
                <select
                  value={selectedElement.animation || 'none'}
                  onChange={(e) => updateElement(selectedElement.id, { animation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                >
                  <option value="none">Không có</option>
                  <option value="fadeIn">Fade In</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="slideDown">Slide Down</option>
                  <option value="slideLeft">Slide Left</option>
                  <option value="slideRight">Slide Right</option>
                  <option value="scaleIn">Scale In</option>
                  <option value="rotateIn">Rotate In</option>
                </select>
                {selectedElement.animation && selectedElement.animation !== 'none' && (
                  <button
                    onClick={() => {
                      const element = document.querySelector(`[data-element-id="${selectedElement.id}"]`)
                      if (element) {
                        element.classList.remove('animate-demo')
                        void element.offsetWidth
                        element.classList.add('animate-demo')
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Xem Demo
                  </button>
                )}
              </div>
            </details>

            {/* Continuous Animation */}
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Chuyển động liên tục</span>
                <span className="material-symbols-outlined text-gray-500 group-open:rotate-90 transition-transform">
                  chevron_right
                </span>
              </summary>
              <div className="mt-2 p-3 space-y-2">
                <select
                  value={selectedElement.continuousAnimation || 'none'}
                  onChange={(e) => updateElement(selectedElement.id, { continuousAnimation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                >
                  <option value="none">Không có</option>
                  <option value="pulse">Pulse (Nhấp nháy)</option>
                  <option value="bounce">Bounce (Nảy)</option>
                  <option value="shake">Shake (Rung)</option>
                  <option value="rotate">Rotate (Xoay)</option>
                  <option value="float">Float (Lơ lửng)</option>
                </select>
                {selectedElement.continuousAnimation && selectedElement.continuousAnimation !== 'none' && (
                  <button
                    onClick={() => {
                      const element = document.querySelector(`[data-element-id="${selectedElement.id}"]`)
                      if (element) {
                        const currentAnim = element.style.animation
                        element.style.animation = 'none'
                        setTimeout(() => {
                          element.style.animation = currentAnim
                        }, 10)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Xem Demo
                  </button>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </aside>
  )
}

export default PropertiesPanel
