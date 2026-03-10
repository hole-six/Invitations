// Base64 Media Service - Lưu ảnh Base64 vào database
class Base64MediaService {
  
  // Lưu ảnh Base64 vào database
  async saveBase64Image(imageData) {
    try {
      const token = localStorage.getItem('userToken')
      
      const response = await fetch('/api/v1/wedding/media/base64', {
        method: 'POST',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: imageData.name,
          base64_data: imageData.url, // data:image/jpeg;base64,/9j/4AAQ...
          file_size: imageData.size,
          file_type: imageData.url.split(';')[0].split(':')[1] || 'image/jpeg'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Base64 image saved to database:', result)
      
      return {
        id: result.data.id,
        file_key: result.data.file_key || `base64/${imageData.name}`,
        url: imageData.url, // Keep Base64 URL for display
        name: imageData.name,
        size: imageData.size,
        created_at: result.data.created_at || new Date().toISOString(),
        usage_count: 0,
        compression_ratio: imageData.compression_ratio,
        is_base64: true
      }
    } catch (error) {
      console.error('Failed to save Base64 image:', error)
      
      // Fallback: Return mock entry for local storage
      return {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file_key: `local/${imageData.name}`,
        url: imageData.url,
        name: imageData.name,
        size: imageData.size,
        created_at: new Date().toISOString(),
        usage_count: 0,
        compression_ratio: imageData.compression_ratio,
        is_base64: true,
        is_local: true // Flag for local-only storage
      }
    }
  }

  // Lấy danh sách ảnh Base64 từ database
  async getBase64Images(params = {}) {
    try {
      const token = localStorage.getItem('userToken')
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString 
        ? `/api/v1/wedding/media/base64?${queryString}` 
        : `/api/v1/wedding/media/base64`
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn('Base64 API not available, using local storage fallback')
        return this.getLocalBase64Images()
      }

      const result = await response.json()
      console.log('📦 Base64 images loaded from database:', result.data?.length || 0)
      
      return result
    } catch (error) {
      console.warn('Failed to load Base64 images from database:', error)
      return this.getLocalBase64Images()
    }
  }

  // Fallback: Lưu/lấy từ localStorage
  getLocalBase64Images() {
    try {
      const stored = localStorage.getItem('base64_images')
      if (!stored) return { data: [], pagination: { total: 0 } }
      
      const images = JSON.parse(stored)
      console.log('📦 Base64 images loaded from localStorage:', images.length)
      
      return {
        data: images,
        pagination: { total: images.length, page: 1, limit: 20 }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return { data: [], pagination: { total: 0 } }
    }
  }

  saveToLocalStorage(imageEntry) {
    try {
      const stored = localStorage.getItem('base64_images')
      const images = stored ? JSON.parse(stored) : []
      
      // Add new image to beginning
      images.unshift(imageEntry)
      
      // Keep only last 50 images to avoid localStorage bloat
      if (images.length > 50) {
        images.splice(50)
      }
      
      localStorage.setItem('base64_images', JSON.stringify(images))
      console.log('💾 Saved to localStorage:', imageEntry.name)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  // Xóa ảnh Base64
  async deleteBase64Image(imageId, isLocal = false) {
    if (isLocal) {
      return this.deleteFromLocalStorage(imageId)
    }

    try {
      const token = localStorage.getItem('userToken')
      
      const response = await fetch(`/api/v1/wedding/media/base64/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`)
      }

      console.log('🗑️ Base64 image deleted from database')
      return true
    } catch (error) {
      console.error('Failed to delete Base64 image:', error)
      return false
    }
  }

  deleteFromLocalStorage(imageId) {
    try {
      const stored = localStorage.getItem('base64_images')
      if (!stored) return true
      
      const images = JSON.parse(stored)
      const filtered = images.filter(img => img.id !== imageId)
      
      localStorage.setItem('base64_images', JSON.stringify(filtered))
      console.log('🗑️ Deleted from localStorage:', imageId)
      return true
    } catch (error) {
      console.error('Failed to delete from localStorage:', error)
      return false
    }
  }
}

export default new Base64MediaService()