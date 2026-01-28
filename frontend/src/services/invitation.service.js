import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

class InvitationService {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`${API_ENDPOINTS.INVITATIONS}?${queryString}`);
  }

  async getById(id) {
    return apiService.get(API_ENDPOINTS.INVITATION_DETAIL(id));
  }

  async create(data) {
    return apiService.post(API_ENDPOINTS.INVITATIONS, data);
  }

  async createFromTemplate(templateId, data = {}) {
    return apiService.post(API_ENDPOINTS.INVITATIONS_FROM_TEMPLATE, {
      template_id: templateId,
      ...data,
    });
  }

  async update(id, data) {
    return apiService.put(API_ENDPOINTS.INVITATION_DETAIL(id), data);
  }

  async delete(id) {
    return apiService.delete(API_ENDPOINTS.INVITATION_DETAIL(id));
  }

  async publish(id) {
    return apiService.post(API_ENDPOINTS.INVITATION_PUBLISH(id));
  }

  async duplicate(id) {
    return apiService.post(API_ENDPOINTS.INVITATION_DUPLICATE(id));
  }

  async getVersions(id) {
    return apiService.get(API_ENDPOINTS.INVITATION_VERSIONS(id));
  }

  async restore(id, versionNumber) {
    return apiService.post(API_ENDPOINTS.INVITATION_RESTORE(id), { version_number: versionNumber });
  }

  async getPublicInvitation(slug, password = null) {
    const payload = password ? { password } : {}
    return apiService.post(API_ENDPOINTS.PUBLIC_INVITATION(slug), payload)
  }

  async getAnalytics(id) {
    return apiService.get(API_ENDPOINTS.INVITATION_ANALYTICS(id));
  }

  async trackEvent(id, eventType, eventData = {}) {
    return apiService.post(API_ENDPOINTS.INVITATION_TRACK(id), {
      event_type: eventType,
      event_data: eventData,
    });
  }
}

export default new InvitationService();
