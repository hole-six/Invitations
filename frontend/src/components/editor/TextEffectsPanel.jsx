import React, { useState } from 'react'

const TextEffectsPanel = ({ element, updateElement }) => {
  const [activeTab, setActiveTab] = useState('shadow')

  const handleShadowChange = (property, value) => {
    const shadow = element.textShadow || {
      enabled: false,
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: '#000000',
      opacity: 0.5
    }
    
    updateElement(element.id, {
      textShadow: { ...shadow, [property]: value }
    })
  }

  const handleOutlineChange = (property, value) => {
    const outline = element.textOutline || {
      enabled: false,
      width: 2,
      color: '#000000',
      opacity: 1
    }
    
    updateElement(element.id, {
      textOutline: { ...outline, [property]: value }
    })
  }

  const handleBackgroundChange = (property, value) => {
    const background = element.textBackground || {
      enabled: false,
      color: '#ffffff',
      opacity: 0.8,
      padding: 8,
      borderRadius: 4
    }
    
    updateElement(element.id, {
      textBackground: { ...background, [property]: value }
    })
  }

  const tabs = [
    { id: 'shadow', label: 'Đổ bóng', icon: 'shadow' },
    { id: 'outline', label: 'Viền', icon: 'border_style' },
    { id: 'background', label: 'Nền', icon: 'format_color_fill' },
    { id: 'gradient', label: 'Gradient', icon: 'gradient' },
    { id: 'glow', label: 'Phát sáng', icon: 'light_mode' }
  ]

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shadow Tab */}
      {activeTab === 'shadow' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bật đổ bóng
            </label>
            <input
              type="checkbox"
              checked={element.textShadow?.enabled || false}
              onChange={(e) => handleShadowChange('enabled', e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </div>

          {element.textShadow?.enabled && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ lệch X: {element.textShadow?.offsetX || 2}px
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={element.textShadow?.offsetX || 2}
                  onChange={(e) => handleShadowChange('offsetX', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ lệch Y: {element.textShadow?.offsetY || 2}px
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={element.textShadow?.offsetY || 2}
                  onChange={(e) => handleShadowChange('offsetY', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ mờ: {element.textShadow?.blur || 4}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={element.textShadow?.blur || 4}
                  onChange={(e) => handleShadowChange('blur', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Màu bóng
                </label>
                <input
                  type="color"
                  value={element.textShadow?.color || '#000000'}
                  onChange={(e) => handleShadowChange('color', e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ trong suốt: {Math.round((element.textShadow?.opacity || 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.textShadow?.opacity || 0.5}
                  onChange={(e) => handleShadowChange('opacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Outline Tab */}
      {activeTab === 'outline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bật viền chữ
            </label>
            <input
              type="checkbox"
              checked={element.textOutline?.enabled || false}
              onChange={(e) => handleOutlineChange('enabled', e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </div>

          {element.textOutline?.enabled && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ dày: {element.textOutline?.width || 2}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={element.textOutline?.width || 2}
                  onChange={(e) => handleOutlineChange('width', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Màu viền
                </label>
                <input
                  type="color"
                  value={element.textOutline?.color || '#000000'}
                  onChange={(e) => handleOutlineChange('color', e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ trong suốt: {Math.round((element.textOutline?.opacity || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.textOutline?.opacity || 1}
                  onChange={(e) => handleOutlineChange('opacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Background Tab */}
      {activeTab === 'background' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bật nền chữ
            </label>
            <input
              type="checkbox"
              checked={element.textBackground?.enabled || false}
              onChange={(e) => handleBackgroundChange('enabled', e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </div>

          {element.textBackground?.enabled && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Màu nền
                </label>
                <input
                  type="color"
                  value={element.textBackground?.color || '#ffffff'}
                  onChange={(e) => handleBackgroundChange('color', e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ trong suốt: {Math.round((element.textBackground?.opacity || 0.8) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.textBackground?.opacity || 0.8}
                  onChange={(e) => handleBackgroundChange('opacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Padding: {element.textBackground?.padding || 8}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={element.textBackground?.padding || 8}
                  onChange={(e) => handleBackgroundChange('padding', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Bo góc: {element.textBackground?.borderRadius || 4}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={element.textBackground?.borderRadius || 4}
                  onChange={(e) => handleBackgroundChange('borderRadius', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Gradient Tab */}
      {activeTab === 'gradient' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bật chữ gradient
            </label>
            <input
              type="checkbox"
              checked={element.gradientText?.enabled || false}
              onChange={(e) => {
                const gradient = element.gradientText || {
                  enabled: false,
                  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }
                updateElement(element.id, {
                  gradientText: { ...gradient, enabled: e.target.checked }
                })
              }}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </div>

          {element.gradientText?.enabled && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                  Chọn gradient đẹp
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
                    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                    'linear-gradient(135deg, #f77062 0%, #fe5196 100%)'
                  ].map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateElement(element.id, {
                          gradientText: { ...element.gradientText, gradient }
                        })
                      }}
                      className="h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105"
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Glow Tab */}
      {activeTab === 'glow' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bật hiệu ứng phát sáng
            </label>
            <input
              type="checkbox"
              checked={element.glowEffect?.enabled || false}
              onChange={(e) => {
                const glow = element.glowEffect || {
                  enabled: false,
                  color: element.color || '#ffffff',
                  blur: 10
                }
                updateElement(element.id, {
                  glowEffect: { ...glow, enabled: e.target.checked }
                })
              }}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </div>

          {element.glowEffect?.enabled && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Màu phát sáng
                </label>
                <input
                  type="color"
                  value={element.glowEffect?.color || element.color || '#ffffff'}
                  onChange={(e) => {
                    updateElement(element.id, {
                      glowEffect: { ...element.glowEffect, color: e.target.value }
                    })
                  }}
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Độ mờ: {element.glowEffect?.blur || 10}px
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={element.glowEffect?.blur || 10}
                  onChange={(e) => {
                    updateElement(element.id, {
                      glowEffect: { ...element.glowEffect, blur: parseInt(e.target.value) }
                    })
                  }}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TextEffectsPanel
