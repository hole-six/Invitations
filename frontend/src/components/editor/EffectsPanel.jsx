import React, { useState } from 'react'

const EffectsPanel = ({ onClose, selectedElement, updateElement }) => {
  const [activeTab, setActiveTab] = useState('entrance')

  const entranceEffects = [
    { id: 'none', name: 'None', icon: 'block' },
    { id: 'fadeIn', name: 'Fade In All', icon: 'opacity' },
    { id: 'slideUp', name: 'Slide Up All', icon: 'arrow_upward' },
    { id: 'scaleIn', name: 'Scale In All', icon: 'zoom_in' },
    { id: 'flipIn', name: 'Flip In All', icon: 'flip' },
    { id: 'slideUpMix', name: 'Slide Up Mix', icon: 'trending_up' },
    { id: 'fadeInMix', name: 'Fade In Mix', icon: 'blur_on' },
  ]

  const openEffects = [
    { id: 'none', name: 'Không có', icon: 'block' },
    { id: 'envelope', name: 'Phong bì', icon: 'mail' },
    { id: 'curtain', name: 'Rèm cửa', icon: 'curtains' },
    { id: 'door', name: 'Cửa mở', icon: 'door_open' },
  ]

  const exitEffects = [
    { id: 'none', name: 'Không có', icon: 'block' },
    { id: 'fadeOut', name: 'Fade Out', icon: 'opacity' },
    { id: 'slideDown', name: 'Slide Down', icon: 'arrow_downward' },
    { id: 'scaleOut', name: 'Scale Out', icon: 'zoom_out' },
  ]

  const tabs = [
    { id: 'entrance', label: 'Hiệu ứng động', icon: 'animation' },
    { id: 'open', label: 'Hiệu ứng mở màn', icon: 'open_in_full' },
    { id: 'exit', label: 'Hiệu ứng rời', icon: 'exit_to_app' }
  ]

  const handleEffectSelect = (effectId) => {
    if (selectedElement && updateElement) {
      updateElement(selectedElement.id, {
        animation: effectId
      })
    }
  }

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hiệu ứng</h3>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium border-b-2 transition-colors ${
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'entrance' && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <span className="material-symbols-outlined text-pink-600">auto_awesome</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Hiệu ứng dựng sẵn</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Chọn 1 mẫu hiệu ứng để áp dụng cho toàn bộ trang
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {entranceEffects.map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => handleEffectSelect(effect.id)}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105 group"
                >
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">{effect.icon}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                    {effect.name}
                  </p>
                </button>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-3 rounded-lg bg-gray-700 text-white font-medium flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors">
              <span className="material-symbols-outlined">play_circle</span>
              Xem trước hiệu ứng
            </button>
          </div>
        )}

        {activeTab === 'open' && (
          <div className="grid grid-cols-2 gap-3">
            {openEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => handleEffectSelect(effect.id)}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105 group"
              >
                <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[24px]">{effect.icon}</span>
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                  {effect.name}
                </p>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'exit' && (
          <div className="grid grid-cols-2 gap-3">
            {exitEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => handleEffectSelect(effect.id)}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all hover:scale-105 group"
              >
                <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[24px]">{effect.icon}</span>
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                  {effect.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EffectsPanel
