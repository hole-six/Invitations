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
