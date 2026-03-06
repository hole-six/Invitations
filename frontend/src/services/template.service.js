import apiService from './api.service'
import { API_ENDPOINTS } from '../config/api'

class TemplateService {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    const endpoint = params ? `${API_ENDPOINTS.TEMPLATES}?${params}` : API_ENDPOINTS.TEMPLATES
    return apiService.get(endpoint)
  }

  async getById(id) {
    // API uses query param and returns array, similar to invitations
    const response = await apiService.get(`/api/v1/wedding/templates?id=${id}`);
    
    // Response.data is array, get first item
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return { data: response.data[0] }; // Return first item as single object
    }
    
    throw new Error('Template not found');
  }

  async create(data) {
    return apiService.post(API_ENDPOINTS.TEMPLATE_CREATE, data)
  }

  async update(idOrUuid, data) {
    // Backend expects uuid, but we might receive id
    // If data contains uuid, use it; otherwise use the parameter
    const uuid = data.uuid || idOrUuid;
    
    return apiService.put(API_ENDPOINTS.TEMPLATE_UPDATE, {
      uuid,
      ...data,
    })
  }

  async delete(idOrUuid) {
    // Backend might expect uuid instead of id
    // Try to use uuid if it's a UUID format, otherwise use id
    const isUuid = typeof idOrUuid === 'string' && idOrUuid.includes('-');
    
    return apiService.request(API_ENDPOINTS.TEMPLATE_DELETE, {
      method: 'DELETE',
      body: JSON.stringify(isUuid ? { uuid: idOrUuid } : { id: idOrUuid }),
    })
  }

  async getCategories() {
    return apiService.get(API_ENDPOINTS.CATEGORIES)
  }

  // NEW: Category Management (Admin)
  async createCategory(data) {
    return apiService.post(API_ENDPOINTS.CATEGORY_CREATE, data)
  }

  async updateCategory(id, data) {
    return apiService.put(API_ENDPOINTS.CATEGORY_UPDATE, {
      id,
      ...data,
    })
  }

  async deleteCategory(id) {
    return apiService.request(API_ENDPOINTS.CATEGORY_DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  }
}

export default new TemplateService()
