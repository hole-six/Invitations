import React, { useState, useRef } from 'react'

const ImageUploadPanel = ({ onAddImage, onClose }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Mock storage data - replace with real API
  const storageUsed = 0
  const storageLimit = 10
  const imagesUploaded = uploadedImages.length
  const imagesLimit = 15

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      handleFiles(imageFiles)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files) => {
    setUploading(true)
    
    for (const file of files) {
      try {
        // Add to canvas
        await onAddImage(file)
        
        // Add to uploaded list
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name,
            size: file.size
          }])
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
    
    setUploading(false)
  }

  const handleImageClick = (image) => {
    // Create a File object from the data URL
    fetch(image.url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], image.name, { type: 'image/png' })
        onAddImage(file)
      })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hình ảnh</h3>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Storage Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">cloud_upload</span>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">Free</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Kéo thả hoặc nhấn vào đây để tải lên file. Có thể tải lên tối đa 15 ảnh cùng một lúc.
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              Đã tải: <span className="font-semibold text-gray-900 dark:text-white">{imagesUploaded}/{imagesLimit}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Còn lại: <span className="font-semibold text-gray-900 dark:text-white">{imagesLimit - imagesUploaded}</span>
            </span>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-blue-600">
                {uploading ? 'hourglass_empty' : 'cloud_upload'}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {uploading ? 'Đang tải lên...' : 'Hãy chọn ảnh bạn muốn thay thế'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kéo thả hoặc click để chọn file
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Tệp đã tải lên
            </h4>
            <div className="space-y-2">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                >
                  <div className="size-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-primary">
                    add_circle
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage Usage */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Tổng 0 tệp (0.0000 GB / 5GB)
          </h4>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {storageUsed.toFixed(4)} GB / {storageLimit} GB đã sử dụng
          </p>
        </div>

        {/* Tips */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-gray-600 dark:text-gray-400 mt-0.5">
              info
            </span>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="font-semibold mb-1">Mẹo:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Hỗ trợ: JPG, PNG, GIF, WebP</li>
                <li>Kích thước tối đa: 10MB/ảnh</li>
                <li>Kéo thả nhiều ảnh cùng lúc</li>
                <li>Click vào ảnh đã tải để thêm vào canvas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUploadPanel
