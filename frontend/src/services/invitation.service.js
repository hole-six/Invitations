import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

class InvitationService {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.INVITATIONS}?${queryString}` : API_ENDPOINTS.INVITATIONS;
    return apiService.get(endpoint);
  }

  async getById(uuid) {
    // API uses UUID with query param and returns array
    const response = await apiService.get(`/api/v1/wedding/invitations?uuid=${uuid}`);
    
    // Response.data is array, get first item
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return { data: response.data[0] }; // Return first item as single object
    }
    
    throw new Error('Invitation not found');
  }

  async create(data) {
    return apiService.post(API_ENDPOINTS.INVITATION_CREATE, data);
  }

  async createFromTemplate(templateId, data = {}) {
    return apiService.post(API_ENDPOINTS.INVITATIONS_FROM_TEMPLATE, {
      template_id: templateId,
      ...data,
    });
  }

  async update(idOrUuid, data) {
    // Backend expects uuid, similar to template service
    const uuid = data.uuid || idOrUuid;
    
    return apiService.put(API_ENDPOINTS.INVITATION_UPDATE, {
      uuid,
      ...data,
    });
  }

  async delete(uuid) {
    // New API expects uuid in body
    return apiService.request(API_ENDPOINTS.INVITATION_DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ uuid }),
    });
  }

  async publish(id) {
    return apiService.post(API_ENDPOINTS.INVITATION_PUBLISH(id));
  }

  // NEW: Trial Publication Methods
  async publishTrial(id) {
    return apiService.post(API_ENDPOINTS.INVITATION_PUBLISH_TRIAL(id));
  }

  async confirmTrial(id) {
    return apiService.post(API_ENDPOINTS.INVITATION_CONFIRM_TRIAL(id));
  }

  async getTrialStatus(id) {
    return apiService.get(API_ENDPOINTS.INVITATION_TRIAL_STATUS(id));
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
    // New API: GET for public, POST for password-protected
    if (password) {
      return apiService.post(API_ENDPOINTS.PUBLIC_INVITATION(slug), { password })
    } else {
      return apiService.get(API_ENDPOINTS.PUBLIC_INVITATION(slug))
    }
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
