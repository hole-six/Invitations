import apiService from './api.service'
import { API_ENDPOINTS } from '../config/api'

class TemplateService {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return apiService.get(`${API_ENDPOINTS.TEMPLATES}?${params}`)
  }

  async getById(id) {
    return apiService.get(API_ENDPOINTS.TEMPLATE_DETAIL(id))
  }

  async create(data) {
    return apiService.post(API_ENDPOINTS.TEMPLATES, data)
  }

  async update(id, data) {
    return apiService.put(API_ENDPOINTS.TEMPLATE_DETAIL(id), data)
  }

  async delete(id) {
    return apiService.delete(API_ENDPOINTS.TEMPLATE_DETAIL(id))
  }

  async getCategories() {
    return apiService.get(API_ENDPOINTS.TEMPLATE_CATEGORIES)
  }
}

export default new TemplateService()
