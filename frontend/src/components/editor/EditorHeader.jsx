import React from 'react'

const EditorHeader = ({ formData, invitation, saving, onSave, onBack, onPreview, onPublish }) => {
  const getStatusText = () => {
    if (saving) return 'Đang lưu...'
    if (invitation?.status === 'published') return 'Đã xuất bản'
    return 'Đang chỉnh sửa'
  }

  const getStatusColor = () => {
    if (saving) return 'text-yellow-600'
    if (invitation?.status === 'published') return 'text-green-600'
    return 'text-blue-600'
  }

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 z-20 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-2xl">favorite</span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-gray-900 dark:text-white text-sm font-bold leading-tight">
            {invitation?.title || formData.title || 'Thiệp Cưới Mới'}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${saving ? 'bg-yellow-400' : 'bg-green-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${saving ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            </span>
            <span className={`text-xs ${getStatusColor()} font-medium`}>{getStatusText()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onPreview}
          className="flex items-center justify-center h-10 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] mr-2">visibility</span>
          Xem Trước
        </button>
        <button 
          onClick={() => onSave(false)}
          disabled={saving || !invitation}
          className="flex items-center justify-center h-10 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu Nháp'}
        </button>
        <button 
          onClick={onPublish}
          disabled={saving || !invitation}
          className="flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px] mr-2">publish</span>
          Xuất Bản
        </button>
      </div>
    </header>
  )
}

export default EditorHeader
