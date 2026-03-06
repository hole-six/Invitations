// Media Service - Using Vite proxy to avoid CORS
// Proxy configured in vite.config.js: /system -> https://api.hiweb.vn/system

class MediaService {
  // Get all media files for current user
  // API: GET /system/listFiles (proxied to https://api.hiweb.vn/system/listFiles)
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/system/listFiles?${queryString}` 
      : `/system/listFiles`;
    
    const token = localStorage.getItem('userToken');
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Failed to fetch files: ${response.status}`);
    }

    return response.json();
  }

  // Upload file - Two-step process
  // Step 1: Upload file to backend
  // Step 2: Confirm upload with file_key
  async upload(file) {
    console.log('📤 Step 1: Uploading file:', file.name);
    console.log('📊 File details:', {
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2) + ' KB',
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });
    
    const token = localStorage.getItem('userToken');
    console.log('🔑 Token:', token ? 'Present' : 'Missing');
    
    // Step 1: Upload file to backend
    const formData = new FormData();
    formData.append('file', file);
    
    // Use proxy path (vite.config.js proxies /system to https://api.hiweb.vn/system)
    const endpoint = `/system/upload`;
    console.log('📤 Sending FormData to:', endpoint, '(via Vite proxy)');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': token || ''
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    // Get response as text first to see what we're getting
    const responseText = await response.text();
    console.log('📄 Response text (first 500 chars):', responseText.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📦 Parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('❌ Failed to parse JSON. Response is not JSON:', e);
      console.error('Full response:', responseText);
      throw new Error('Server returned non-JSON response (possibly 404 or error page)');
    }

    if (!response.ok) {
      console.error('❌ Upload failed:', data);
      throw new Error(data.msg || `Failed to upload: ${response.status}`);
    }

    console.log('✅ Step 1 complete - Upload successful');

    const uploadData = data.data || data;
    
    if (!uploadData.file_key) {
      throw new Error('Invalid response - missing file_key');
    }

    // Return file_key and final_url for Step 2 (confirm)
    return { 
      file_key: uploadData.file_key,
      final_url: uploadData.final_url || uploadData.url
    };
  }

  // Confirm upload
  // API: POST /system/confirmUpload (proxied)
  async confirmUpload(fileKey) {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch(`/system/confirmUpload`, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file_key: fileKey })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Failed to confirm: ${response.status}`);
    }

    return response.json();
  }

  // Delete file
  // API: POST /system/deleteFile (proxied, NOTE: POST not DELETE!)
  async delete(fileKey) {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch(`/system/deleteFile`, {
      method: 'POST', // NOTE: POST not DELETE!
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
}

export default new MediaService();
