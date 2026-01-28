import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

class GuestService {
  async getAll(invitationId) {
    return apiService.get(API_ENDPOINTS.INVITATION_GUESTS(invitationId));
  }

  async create(invitationId, data) {
    return apiService.post(API_ENDPOINTS.INVITATION_GUESTS(invitationId), data);
  }

  async update(id, data) {
    return apiService.put(API_ENDPOINTS.GUEST_DETAIL(id), data);
  }

  async delete(id) {
    return apiService.delete(API_ENDPOINTS.GUEST_DETAIL(id));
  }

  async import(file) {
    return apiService.uploadFile(API_ENDPOINTS.GUESTS_IMPORT, file);
  }

  async export(invitationId) {
    return apiService.get(`${API_ENDPOINTS.GUESTS_EXPORT}?invitation_id=${invitationId}`);
  }

  async submitRSVP(invitationId, data) {
    return apiService.post(API_ENDPOINTS.INVITATION_RSVP(invitationId), data);
  }

  async getRSVPList(invitationId) {
    return apiService.get(API_ENDPOINTS.INVITATION_RSVP(invitationId));
  }
}

export default new GuestService();
