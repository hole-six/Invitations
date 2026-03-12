// Media Service - Using proper S3 upload flow
// Flow: Get Link Upload → Upload to S3 → Confirm Upload
import apiService from './api.service';

class MediaService {
  // Get all media files for current user
  async getAll(params = {}) {
    // Always default to 'wedding' folder if not specified
    const folder = params.folder || 'wedding';
    const queryParams = { ...params, folder };

    console.log('📤 Loading media files from folder:', folder);

    try {
      // Use apiService for consistent URL and Auth handling
      const result = await apiService.get('/api/v1/system/listFiles', queryParams);

      console.log('📦 Files loaded:', {
        total_files: result.data?.length || 0,
        pagination: result.pagination
      });

      return result;
    } catch (error) {
      console.error('❌ List files failed:', error);
      throw error;
    }
  }

  // S3 Upload Flow (Step 1: Link -> Step 2: PUT -> Step 3: Confirm)
  async upload(file, folder = 'wedding') {
    console.log('🚀 Starting S3 upload flow for:', file.name);

    try {
      // Step 1: Get S3 Upload Link (Presigned URL)
      const ext = file.name.split('.').pop() || 'jpg';

      const uploadPayload = {
        size: file.size,
        ext: ext,
        folder: folder
      };

      console.log('📤 Step 1: Getting presigned URL...', uploadPayload);

      const presignedResponse = await apiService.post('/api/v1/system/upload', uploadPayload);

      if (!presignedResponse.status) {
        throw new Error(presignedResponse.msg || 'Failed to get upload URL');
      }

      const { upload_url, file_key, final_url } = presignedResponse.data;

      // Step 2: Upload File directly to S3
      console.log('📤 Step 2: Uploading file to S3...');

      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        body: file, // Upload file directly, not FormData for S3
        headers: {
          'Content-Type': file.type || 'image/jpeg'
        }
      });

      if (!uploadResponse.ok) {
        console.error('❌ S3 upload failed:', uploadResponse.status, uploadResponse.statusText);
        throw new Error(`S3 upload failed: ${uploadResponse.status}`);
      }

      console.log('✅ Step 2 complete - File uploaded to S3');

      // Step 3: Confirm Upload with backend
      console.log('📤 Step 3: Confirming upload with backend...', file_key);
      const confirmResponse = await apiService.post('/api/v1/system/confirmUpload', {
        file_key: file_key
      });

      console.log('✅ Step 3 complete - Upload confirmed');

      return {
        file_key,
        final_url: final_url || upload_url.split('?')[0],
        url: final_url
      };

    } catch (error) {
      console.error('❌ S3 upload flow failed:', error);
      throw error;
    }
  }

  // Delete file
  async delete(fileKey) {
    try {
      return await apiService.post('/api/v1/system/deleteFile', { file_key: fileKey });
    } catch (error) {
      console.error('❌ Delete file failed:', error);
      throw error;
    }
  }

  // Get folder contents
  async getFolder(folderPath = '') {
    try {
      return await apiService.get('/api/v1/system/folder', { path: folderPath });
    } catch (error) {
      console.error('❌ Get folder failed:', error);
      throw error;
    }
  }

  // Legacy upload method (fallback to Base64 if S3 fails)
  async uploadFallback(file) {
    console.log('🔄 Using Base64 fallback for:', file.name);

    // This will trigger the Base64 flow in MediaLibraryModal
    throw new Error('S3_UPLOAD_FAILED');
  }
}

export default new MediaService();
