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
    // Format data to match backend expectations
    const formattedData = {
      uuid: data.uuid, // UUID of the admin user creating the template (REQUIRED)
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      thumbnail_url: data.thumbnail_url || '',
      category_id: data.category_id,
      is_premium: data.is_premium ? 1 : 0,
      is_editable: data.is_editable !== undefined ? (data.is_editable ? 1 : 0) : 1, // Default true
      is_active: data.status === 'published' ? 1 : 0,
      template_type: data.template_type || 'html',
      html_template: data.html_template || '', // REQUIRED: html_template must be present
      tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : (data.tags || '[]'),
    };
    
    // Add design_data if provided
    if (data.design_data) {
      formattedData.design_data = data.design_data;
    }
    
    // Validate UUID is present (creator's UUID)
    if (!formattedData.uuid) {
      throw new Error('UUID is required - must be the admin user UUID creating the template');
    }
    
    // DO NOT send id for CREATE (backend will auto-generate)
    // Remove any null/undefined fields except uuid
    Object.keys(formattedData).forEach(key => {
      if (key !== 'uuid' && (formattedData[key] === null || formattedData[key] === undefined)) {
        delete formattedData[key];
      }
    });
    
    console.log('📤 Creating template with data:', formattedData);
    
    return apiService.post(API_ENDPOINTS.TEMPLATE_CREATE, formattedData)
  }

  async update(idOrUuid, data) {
    // Backend expects both id (number) AND uuid (string) for update
    // Priority: use uuid from data, then from parameter, then use id
    let updateData = { ...data };
    
    // Ensure we have uuid in the payload
    if (!updateData.uuid) {
      // If uuid not in data, check if parameter is uuid
      if (typeof idOrUuid === 'string' && idOrUuid.includes('-')) {
        updateData.uuid = idOrUuid;
      } else {
        throw new Error('Backend requires UUID for update. Please ensure template.uuid is loaded and passed.');
      }
    }
    
    // Ensure we have id as integer
    if (!updateData.id) {
      // If id not in data, check if parameter is id
      if (typeof idOrUuid === 'number' || (typeof idOrUuid === 'string' && !idOrUuid.includes('-'))) {
        updateData.id = parseInt(idOrUuid);
      }
    } else {
      updateData.id = parseInt(updateData.id);
    }
    
    // Format data to match backend expectations
    const formattedData = {
      ...updateData,
      is_premium: updateData.is_premium ? 1 : 0,
      is_editable: updateData.is_editable ? 1 : 0,
      is_active: updateData.status === 'published' ? 1 : 0,
      tags: Array.isArray(updateData.tags) ? JSON.stringify(updateData.tags) : (updateData.tags || '[]'),
    };
    
    // Remove fields that backend doesn't expect
    delete formattedData.status; // Backend uses is_active
    
    console.log('📤 Sending UPDATE with data:', formattedData);
    
    return apiService.put(API_ENDPOINTS.TEMPLATE_UPDATE, formattedData)
  }

  async delete(idOrUuid) {
    // Backend expects uuid, not id
    // Extract uuid from the template object or use the parameter directly
    let uuid;
    
    if (typeof idOrUuid === 'object') {
      // If it's a template object, get uuid
      uuid = idOrUuid.uuid;
    } else if (typeof idOrUuid === 'string' && idOrUuid.includes('-')) {
      // If it's already a uuid string
      uuid = idOrUuid;
    } else {
      // If it's an id, we need to throw error because backend needs uuid
      throw new Error('Backend requires UUID for delete. Please pass template.uuid instead of template.id');
    }
    
    // Request hard delete including html_template content
    return apiService.request(API_ENDPOINTS.TEMPLATE_DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ 
        uuid,
        hard_delete: true, // Request complete deletion including html_template
        clear_html: true   // Explicitly request to clear html_template field
      }),
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
