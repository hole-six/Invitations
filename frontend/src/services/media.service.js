// Media Service - Using proper S3 upload flow
// Flow: Get Link Upload → Upload to S3 → Confirm Upload

class MediaService {
  // Get all media files for current user
  async getAll(params = {}) {
    console.log('📤 Loading media files with params:', params);
    
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `https://api.hiweb.vn/api/v1/system/listFiles?${queryString}` 
      : `https://api.hiweb.vn/api/v1/system/listFiles`;
    
    const token = localStorage.getItem('userToken');
    console.log('📤 Request to:', endpoint);
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 List files response:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ List files failed:', errorData);
      throw new Error(errorData.msg || `Failed to fetch files: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 Files loaded:', {
      total_files: result.data?.length || 0,
      pagination: result.pagination,
      first_few_files: result.data?.slice(0, 3).map(f => ({
        file_key: f.file_key,
        url: f.url,
        size: f.file_size,
        created: f.created_at
      }))
    });

    return result;
  }

  // S3 Upload Flow
  async upload(file) {
    console.log('🚀 Starting S3 upload flow for:', file.name);
    console.log('📊 File details:', {
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2) + ' KB',
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });
    
    const token = localStorage.getItem('userToken');
    
    try {
      // Step 1: Get S3 Upload Link
      console.log('📤 Step 1: Getting S3 upload link...');
      const linkResponse = await fetch('https://api.hiweb.vn/api/v1/system/upload', {
        method: 'POST',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          filesize: file.size,
          filetype: file.type
        })
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json().catch(() => ({}));
        console.error('❌ Get link failed:', errorData);
        throw new Error(errorData.msg || `Get link failed: ${linkResponse.status}`);
      }

      const linkData = await linkResponse.json();
      console.log('✅ Step 1 complete - Got S3 upload link:', {
        upload_url: linkData.data.upload_url?.substring(0, 100) + '...',
        file_key: linkData.data.file_key
      });

      // Step 2: Upload File directly to S3
      console.log('📤 Step 2: Uploading file to S3...');
      
      const uploadResponse = await fetch(linkData.data.upload_url, {
        method: 'PUT',
        body: file, // Upload file directly, not FormData for S3
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        console.error('❌ S3 upload failed:', uploadResponse.status, uploadResponse.statusText);
        throw new Error(`S3 upload failed: ${uploadResponse.status}`);
      }

      console.log('✅ Step 2 complete - File uploaded to S3');

      // Step 3: Confirm Upload with backend
      console.log('📤 Step 3: Confirming upload with backend...');
      const confirmResponse = await fetch('https://api.hiweb.vn/api/v1/system/confirmUpload', {
        method: 'POST',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_key: linkData.data.file_key
        })
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json().catch(() => ({}));
        console.error('❌ Confirm failed:', errorData);
        throw new Error(errorData.msg || `Confirm failed: ${confirmResponse.status}`);
      }

      const confirmData = await confirmResponse.json();
      console.log('✅ Step 3 complete - Upload confirmed:', confirmData);

      return {
        file_key: linkData.data.file_key,
        final_url: confirmData.data?.final_url || confirmData.data?.url || linkData.data.final_url,
        upload_url: linkData.data.upload_url
      };

    } catch (error) {
      console.error('❌ S3 upload flow failed:', error);
      throw error;
    }
  }

  // Delete file
  async delete(fileKey) {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('https://api.hiweb.vn/api/v1/system/deleteFile', {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file_key: fileKey })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Failed to delete: ${response.status}`);
    }

    return response.json();
  }

  // Get folder contents
  async getFolder(folderPath = '') {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch(`https://api.hiweb.vn/api/v1/system/folder?path=${encodeURIComponent(folderPath)}`, {
      method: 'GET',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Failed to get folder: ${response.status}`);
    }

    return response.json();
  }

  // Legacy upload method (fallback to Base64 if S3 fails)
  async uploadFallback(file) {
    console.log('🔄 Using Base64 fallback for:', file.name);
    
    // This will trigger the Base64 flow in MediaLibraryModal
    throw new Error('S3_UPLOAD_FAILED');
  }
}

export default new MediaService();
