import apiService from './api.service'
import { API_ENDPOINTS } from '../config/api'

class TemplateService {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    const endpoint = params ? `${API_ENDPOINTS.TEMPLATES}?${params}` : API_ENDPOINTS.TEMPLATES
    return apiService.get(endpoint)
  }

  isTemplateRecord(item) {
    if (!item || typeof item !== 'object') return false
    return ['id', 'template_id', 'uuid', 'slug'].some((key) => item[key] !== undefined && item[key] !== null)
  }

  extractTemplateRows(response) {
    if (!response) return []
    if (Array.isArray(response)) return response
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.items)) return response.items
    if (Array.isArray(response.data?.items)) return response.data.items
    if (Array.isArray(response.data?.data)) return response.data.data
    if (this.isTemplateRecord(response.data?.template)) return [response.data.template]
    if (this.isTemplateRecord(response.data)) return [response.data]
    if (this.isTemplateRecord(response)) return [response]
    return []
  }

  findTemplateInRows(rows, identifier) {
    const normalized = String(identifier || '').trim()
    if (!normalized) return null

    return rows.find((item) => {
      if (!item || typeof item !== 'object') return false
      return [item.id, item.template_id, item.uuid, item.slug]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value).trim())
        .includes(normalized)
    }) || null
  }

  async getById(identifier) {
    const normalized = String(identifier || '').trim()
    if (!normalized) throw new Error('Template id is required')

    const isNumericId = /^\d+$/.test(normalized)
    const isLikelyUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)

    const params = new URLSearchParams()
    params.set('per_page', '200')
    params.set('limit', '200')

    if (isLikelyUuid) {
      params.set('uuid', normalized)
    } else if (isNumericId) {
      // Match page-1 behavior and keep one network call only.
      params.set('template_id', normalized)
      params.set('id', normalized)
    } else {
      params.set('slug', normalized)
    }

    const endpoint = `${API_ENDPOINTS.TEMPLATES}?${params.toString()}`
    const response = await apiService.get(endpoint)
    const rows = this.extractTemplateRows(response)
    const matched = this.findTemplateInRows(rows, normalized)

    if (matched) {
      return { data: matched }
    }

    if (rows.length === 1 && this.isTemplateRecord(rows[0])) {
      return { data: rows[0] }
    }

    throw new Error('Template not found')
  }

  async create(data) {
    return apiService.post(API_ENDPOINTS.TEMPLATE_CREATE, data)
  }

  async update(idOrUuid, data) {
    const uuid = data.uuid || idOrUuid

    return apiService.put(API_ENDPOINTS.TEMPLATE_UPDATE, {
      uuid,
      ...data,
    })
  }

  async delete(idOrUuid) {
    const isUuid = typeof idOrUuid === 'string' && idOrUuid.includes('-')

    return apiService.request(API_ENDPOINTS.TEMPLATE_DELETE, {
      method: 'DELETE',
      body: JSON.stringify(isUuid ? { uuid: idOrUuid } : { id: idOrUuid }),
    })
  }

  async getCategories() {
    return apiService.get(API_ENDPOINTS.CATEGORIES)
  }

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
