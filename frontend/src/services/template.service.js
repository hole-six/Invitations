import apiService from './api.service'
import { API_ENDPOINTS } from '../config/api'

class TemplateService {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    const endpoint = params ? `${API_ENDPOINTS.TEMPLATES}?${params}` : API_ENDPOINTS.TEMPLATES
    return apiService.get(endpoint)
  }

  extractTemplateRows(response) {
    if (!response) return []
    if (Array.isArray(response)) return response
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.items)) return response.items
    if (response.data && typeof response.data === 'object') return [response.data]
    if (typeof response === 'object') return [response]
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

    const isLikelyUuid = normalized.includes('-')
    const candidateEndpoints = []

    if (isLikelyUuid) {
      candidateEndpoints.push(`${API_ENDPOINTS.TEMPLATES}?uuid=${encodeURIComponent(normalized)}`)
    }

    candidateEndpoints.push(API_ENDPOINTS.TEMPLATE_DETAIL(normalized))
    candidateEndpoints.push(`${API_ENDPOINTS.TEMPLATES}?id=${encodeURIComponent(normalized)}`)

    let lastError = null

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await apiService.get(endpoint)
        const rows = this.extractTemplateRows(response)
        const matched = this.findTemplateInRows(rows, normalized)

        if (matched) {
          return { data: matched }
        }

        if (rows.length === 1) {
          return { data: rows[0] }
        }
      } catch (error) {
        lastError = error
      }
    }

    if (lastError) throw lastError
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
