import { useState, useRef, useEffect } from 'react'
import mediaService from '../services/media.service'
import base64MediaService from '../services/base64Media.service'
import { useToast } from '../context/ToastContext'

const MediaLibraryModal = ({ onSelectImage, onClose }) => {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('library') // 'library' or 'upload'
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Real data from API
  const [userImages, setUserImages] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
    has_next: false
  })

  // Load images on mount
  useEffect(() => {
    try {
      loadImages()
      checkUserQuota()
    } catch (error) {
      console.error('Failed to initialize media library:', error)
      toast.error('Không thể khởi tạo thư viện ảnh')
    }
  }, [])

  const checkUserQuota = async () => {
    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch('/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const user = data.data
        console.log('👤 User quota:', {
          max_file_size: user.max_file_size,
          max_file_size_MB: (user.max_file_size / 1024 / 1024).toFixed(2) + ' MB',
          max_total_size: user.max_total_size,
          max_total_size_MB: (user.max_total_size / 1024 / 1024).toFixed(2) + ' MB',
          used_size: user.used_size,
          used_size_MB: (user.used_size / 1024 / 1024).toFixed(2) + ' MB',
          available_MB: ((user.max_total_size - user.used_size) / 1024 / 1024).toFixed(2) + ' MB'
        })
        
        // Update storage display
        const usedGB = user.used_size / 1024 / 1024 / 1024
        const totalGB = user.max_total_size / 1024 / 1024 / 1024
        // TODO: Update UI with real quota
      }
    } catch (error) {
      console.error('Failed to check quota:', error)
    }
  }

  const loadImages = async (page = 1) => {
    try {
      setLoading(true)
      
      // Load both server images and Base64 images
      const [serverResponse, base64Response] = await Promise.all([
        mediaService.getAll({ page, limit: 20 }).catch(() => ({ data: [] })),
        base64MediaService.getBase64Images({ page, limit: 20 })
      ])
      
      console.log('📸 Server response:', serverResponse)
      console.log('📸 Base64 response:', base64Response)
      
      // Transform server images
      const serverImages = serverResponse.data ? serverResponse.data.map(item => ({
        id: item.file_key,
        file_key: item.file_key,
        url: item.url,
        name: item.file_key.split('/').pop(),
        size: item.file_size,
        created_at: item.created_at,
        usage_count: 0,
        is_server: true
      })) : []
      
      // Transform Base64 images
      const base64Images = base64Response.data ? base64Response.data.map(item => ({
        id: item.id,
        file_key: item.file_key,
        url: item.url || item.base64_data,
        name: item.name,
        size: item.file_size || item.size,
        created_at: item.created_at,
        usage_count: 0,
        compression_ratio: item.compression_ratio,
        is_base64: true,
        is_local: item.is_local
      })) : []
      
      // Combine and sort by created_at (newest first)
      const allImages = [...base64Images, ...serverImages].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
      
      setUserImages(allImages)
      
      if (serverResponse.pagination) {
        setPagination(serverResponse.pagination)
      }
      
      console.log('📦 Total images loaded:', allImages.length, {
        server: serverImages.length,
        base64: base64Images.length
      })
      
    } catch (error) {
      console.error('Failed to load images:', error)
      toast.error('Không thể tải danh sách ảnh')
    } finally {
      setLoading(false)
    }
  }

  const storageUsed = 0.75 // GB - TODO: Get from API
  const storageLimit = 5 // GB - TODO: Get from API
  const imagesCount = userImages.length
  const imagesLimit = 100 // TODO: Get from API

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
      handleUpload(imageFiles)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleUpload(files)
    }
  }

  // Resize image before upload to ensure it's under size limit
  const resizeImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width
          let height = img.height

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create new file with same name
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(resizedFile)
              } else {
                reject(new Error('Failed to resize image'))
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target.result
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Get user quota to determine size limits
  const getUserQuota = async () => {
    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch('/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.data
      }
    } catch (error) {
      console.error('Failed to get user quota:', error)
    }
    return null
  }

  const handleUpload = async (files) => {
    if (files.length === 0) return

    setUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      console.log('🚀 Starting hybrid upload system (S3 + Base64 fallback)')

      // Process each file
      for (const file of files) {
        try {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} không phải là file ảnh`)
            failCount++
            continue
          }

          console.log('📤 Processing file:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`)

          // Try S3 upload first
          let uploadResult = null
          let useBase64 = false

          try {
            console.log('🌐 Attempting S3 upload...')
            uploadResult = await mediaService.upload(file)
            console.log('✅ S3 upload successful:', uploadResult)

            // Create server file entry
            const serverFileEntry = {
              id: uploadResult.file_key,
              file_key: uploadResult.file_key,
              url: uploadResult.final_url,
              name: file.name,
              size: file.size,
              created_at: new Date().toISOString(),
              usage_count: 0,
              is_server: true
            }

            // Add to userImages list
            setUserImages(prev => [serverFileEntry, ...prev])
            successCount++

            toast.success(`✅ ${file.name}: Tải lên server thành công`)

          } catch (s3Error) {
            console.warn('⚠️ S3 upload failed, falling back to Base64:', s3Error.message)
            useBase64 = true
          }

          // Fallback to Base64 if S3 failed
          if (useBase64) {
            console.log('🔧 Using Base64 fallback for:', file.name)

            // Smart compression for Base64
            let fileToUpload = file
            const originalSizeMB = file.size / 1024 / 1024
            
            // Target size based on original size
            let targetSize
            if (originalSizeMB > 4) {
              targetSize = 800 * 1024 // 800KB for very large files
              toast.info(`📦 File lớn (${originalSizeMB.toFixed(1)}MB), đang nén mạnh...`)
            } else if (originalSizeMB > 2) {
              targetSize = 1.2 * 1024 * 1024 // 1.2MB for medium files
              toast.info(`📦 Đang nén ${file.name}...`)
            } else {
              targetSize = 1.5 * 1024 * 1024 // 1.5MB for small files
            }
            
            if (file.size > targetSize) {
              try {
                // Progressive compression algorithm
                let quality = originalSizeMB > 4 ? 0.5 : 0.7
                let maxDimension = originalSizeMB > 4 ? 1000 : 1200
                let attempts = 0
                const maxAttempts = 8
                
                do {
                  attempts++
                  fileToUpload = await resizeImage(file, maxDimension, maxDimension, quality)
                  const newSizeMB = fileToUpload.size / 1024 / 1024
                  
                  console.log(`🔧 Attempt ${attempts}: ${newSizeMB.toFixed(2)}MB (quality: ${quality.toFixed(2)}, max: ${maxDimension}px)`)
                  
                  if (fileToUpload.size <= targetSize) {
                    console.log(`✅ Compression successful: ${originalSizeMB.toFixed(2)}MB → ${newSizeMB.toFixed(2)}MB`)
                    break
                  }
                  
                  // Adaptive reduction strategy
                  if (attempts <= 3) {
                    quality = Math.max(0.3, quality - 0.15)
                  } else if (attempts <= 6) {
                    maxDimension = Math.max(600, maxDimension - 200)
                    quality = Math.max(0.4, quality - 0.05)
                  } else {
                    maxDimension = Math.max(400, maxDimension - 100)
                    quality = Math.max(0.2, quality - 0.1)
                  }
                  
                } while (fileToUpload.size > targetSize && attempts < maxAttempts && quality > 0.15)
                
              } catch (resizeError) {
                console.error('Resize failed:', resizeError)
                toast.warning(`Không thể nén ${file.name}, sử dụng bản gốc`)
                fileToUpload = file
              }
            }

            // Final size check - more lenient for Base64
            const finalSizeMB = fileToUpload.size / 1024 / 1024
            if (finalSizeMB > 3) {
              toast.error(`${file.name} vẫn quá lớn sau nén (${finalSizeMB.toFixed(2)}MB). Vui lòng chọn ảnh nhỏ hơn.`)
              failCount++
              continue
            }

            // Convert to Base64
            const base64Result = await new Promise((resolve, reject) => {
              try {
                const reader = new FileReader()
                reader.onloadend = () => {
                  if (reader.result) {
                    resolve(reader.result)
                  } else {
                    reject(new Error('FileReader returned empty result'))
                  }
                }
                reader.onerror = () => reject(new Error('FileReader failed'))
                reader.onabort = () => reject(new Error('FileReader aborted'))
                reader.readAsDataURL(fileToUpload)
              } catch (error) {
                reject(error)
              }
            })

            console.log('✅ Base64 conversion successful for:', file.name, `(Final: ${finalSizeMB.toFixed(2)}MB)`)

            // Create a temporary file entry for immediate display
            const tempFileEntry = {
              id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              file_key: `temp/${file.name}`,
              url: base64Result,
              name: file.name,
              size: fileToUpload.size,
              created_at: new Date().toISOString(),
              usage_count: 0,
              compression_ratio: originalSizeMB > 0 ? (originalSizeMB / finalSizeMB).toFixed(1) : '1.0',
              is_base64: true,
              is_processing: true
            }

            // Add to userImages list immediately for UI feedback
            setUserImages(prev => [tempFileEntry, ...prev])

            // Save to localStorage (since Base64 API is not available)
            try {
              const savedEntry = {
                ...tempFileEntry,
                id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                is_local: true,
                is_processing: false
              }

              base64MediaService.saveToLocalStorage(savedEntry)

              // Update the temp entry with real data
              setUserImages(prev => prev.map(img => 
                img.id === tempFileEntry.id ? savedEntry : img
              ))

              console.log('💾 Image saved to localStorage:', savedEntry.name)
              
            } catch (saveError) {
              console.error('Failed to save to localStorage:', saveError)
              
              // Update UI to show error
              setUserImages(prev => prev.map(img => 
                img.id === tempFileEntry.id 
                  ? { ...img, is_processing: false, has_error: true }
                  : img
              ))
            }

            successCount++

            // Show compression info for large files
            if (originalSizeMB > 2) {
              toast.success(`✅ ${file.name}: ${originalSizeMB.toFixed(1)}MB → ${finalSizeMB.toFixed(1)}MB (Base64)`)
            } else {
              toast.success(`✅ ${file.name}: Lưu Base64 thành công`)
            }
          }

        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error)
          toast.error(`${file.name}: ${error.message}`)
          failCount++
        }
      }

      // Show result
      if (successCount > 0) {
        toast.success(`✅ Đã xử lý ${successCount} ảnh thành công!`)
        // Switch to library tab
        setActiveTab('library')
      }

      if (failCount > 0 && successCount === 0) {
        toast.error(`❌ Tất cả ${failCount} ảnh xử lý thất bại`)
      } else if (failCount > 0) {
        toast.warning(`⚠️ ${successCount} thành công, ${failCount} thất bại`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Có lỗi xảy ra khi xử lý ảnh')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (image, e) => {
    e.stopPropagation() // Prevent image selection

    if (!confirm(`Xóa ảnh "${image.name}"?`)) return

    try {
      if (image.is_base64) {
        // Delete Base64 image
        console.log('🗑️ Deleting Base64 image:', image.name)
        
        const success = await base64MediaService.deleteBase64Image(image.id, image.is_local)
        
        if (success) {
          // Remove from UI
          setUserImages(prev => prev.filter(img => img.id !== image.id))
          toast.success('✅ Đã xóa ảnh')
        } else {
          toast.error('Không thể xóa ảnh')
        }
      } else {
        // Delete server image (original logic)
        await mediaService.delete(image.file_key)
        toast.success('✅ Đã xóa ảnh')
        
        // Remove from list
        setUserImages(prev => prev.filter(img => img.id !== image.id))
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
      toast.error('Không thể xóa ảnh')
    }
  }

  const handleImageSelect = (image) => {
    onSelectImage(image)
    onClose()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const filteredImages = userImages.filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thư viện ảnh của tôi</h2>
            <button
              onClick={onClose}
              className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'library'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">photo_library</span>
                Kho ảnh ({imagesCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'upload'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                Tải lên
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB: Library */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Search & Filter */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm ảnh..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
              </div>

              {/* Image Grid */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-500 text-sm">Đang tải...</p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="size-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[40px] text-gray-400">photo_library</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {searchQuery ? 'Không tìm thấy ảnh nào' : 'Chưa có ảnh trong thư viện'}
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Tải ảnh lên ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleImageSelect(image)}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary cursor-pointer transition-all hover:shadow-xl"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs font-semibold truncate mb-1">{image.name}</p>
                          <div className="flex items-center justify-between text-white/80 text-[10px]">
                            <span>{formatFileSize(image.size)}</span>
                            <span>{formatDate(image.created_at)}</span>
                          </div>
                          {image.compression_ratio && parseFloat(image.compression_ratio) > 1.5 && (
                            <div className="mt-1 px-2 py-0.5 bg-green-500/80 rounded text-[9px] text-white font-bold">
                              Nén {image.compression_ratio}x
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Select Icon */}
                      <div className="absolute top-2 right-2 size-8 rounded-full bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteImage(image, e)}
                        className="absolute top-2 left-2 size-8 rounded-full bg-red-500 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <span className="material-symbols-outlined text-white text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Storage Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">cloud_upload</span>
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Hybrid Upload System</span>
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <p>• Tự động thử S3 server trước, fallback Base64 nếu cần</p>
                  <p>• File lớn được nén thông minh giữ chất lượng</p>
                  <p>• Hỗ trợ tất cả định dạng ảnh phổ biến</p>
                  <p>• Lưu trữ đáng tin cậy với dual backup</p>
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
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
                
                <div className="flex flex-col items-center gap-4">
                  <div className="size-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[40px] text-blue-600">
                      {uploading ? 'hourglass_empty' : 'cloud_upload'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {uploading ? 'Đang tải lên...' : 'Kéo thả ảnh vào đây'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      hoặc click để chọn file từ máy tính
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                      Chọn ảnh
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-gray-600 dark:text-gray-400 mt-0.5">
                    tips_and_updates
                  </span>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-semibold mb-2">Mẹo tải ảnh:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Hỗ trợ: JPG, PNG, GIF, WebP</li>
                      <li>Tự động nén file lớn để tối ưu hiệu suất</li>
                      <li>Chất lượng ảnh được giữ tối đa</li>
                      <li>Ảnh nên có tỉ lệ phù hợp với khung mẫu</li>
                      <li>Kéo thả nhiều ảnh cùng lúc để tiết kiệm thời gian</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{imagesCount}</span> ảnh • 
              <span className="font-semibold ml-1">{storageUsed.toFixed(2)} GB</span> đã sử dụng
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaLibraryModal
