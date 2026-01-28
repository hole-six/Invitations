import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

class MediaService {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`${API_ENDPOINTS.MEDIA}?${queryString}`);
  }

  async upload(file, additionalData = {}) {
    return apiService.uploadFile(API_ENDPOINTS.MEDIA_UPLOAD, file, additionalData);
  }

  async delete(id) {
    return apiService.delete(API_ENDPOINTS.MEDIA_DELETE(id));
  }
}

export default new MediaService();
