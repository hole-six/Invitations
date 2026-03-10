import apiService from './api.service'

import { API_ENDPOINTS } from '../config/api'

const adminService = {
  // Dashboard Stats - NEW API
  getDashboardStats: async () => {
    return apiService.get(API_ENDPOINTS.ADMIN_STATS)
  },

  // User Management - NOTE: These endpoints may not exist in new backend
  // TODO: Verify with backend team if user management is supported
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.role && filters.role !== 'all') params.append('role', filters.role)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
    if (filters.page) params.append('page', String(filters.page))

    const query = params.toString()
    return apiService.get(`/admin/users${query ? '?' + query : ''}`)
  },

  createUser: async (userData) => {
    return apiService.post('/admin/users', userData)
  },

  updateUser: async (id, userData) => {
    return apiService.put(`/admin/users/${id}`, userData)
  },

  deleteUser: async (id) => {
    return apiService.delete(`/admin/users/${id}`)
  },

  // Invitation Management - NEW API
  getAllInvitations: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.userId && filters.userId !== 'all') params.append('erp_user_id', filters.userId)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
    if (filters.page) params.append('page', String(filters.page))

    const query = params.toString()
    return apiService.get(`${API_ENDPOINTS.ADMIN_INVITATIONS}${query ? '?' + query : ''}`)
  },

  // Get all users from invitations (extract unique users)
  getAllUsers: async () => {
    // NOTE: Old endpoint /invitations/users may not exist
    // Alternative: Get all invitations and extract unique users
    try {
      const response = await apiService.get(API_ENDPOINTS.ADMIN_INVITATIONS)
      // Extract unique users from invitations
      const users = []
      const userMap = new Map()
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(inv => {
          if (inv.user_uuid && !userMap.has(inv.user_uuid)) {
            userMap.set(inv.user_uuid, {
              uuid: inv.user_uuid,
              // Add other user fields if available in invitation response
            })
          }
        })
        users.push(...userMap.values())
      }
      
      return { data: users }
    } catch (error) {
      console.warn('getAllUsers fallback failed:', error)
      return { data: [] }
    }
  },

  updateInvitationStatus: async (id, status) => {
    // Use invitation service update method with new API
    return apiService.put(API_ENDPOINTS.INVITATION_UPDATE, { id, status })
  },

  deleteInvitation: async (uuid) => {
    // Use UUID for delete as per new API
    return apiService.request(API_ENDPOINTS.INVITATION_DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ uuid })
    })
  },

  // Template Management - Use template service endpoints
  getAllTemplates: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'all') params.append('category_id', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
    if (filters.page) params.append('page', String(filters.page))

    const query = params.toString()
    return apiService.get(`${API_ENDPOINTS.TEMPLATES}${query ? '?' + query : ''}`)
  },

  updateTemplateStatus: async (id, status) => {
    // Use template service update method with new API
    return apiService.put(API_ENDPOINTS.TEMPLATE_UPDATE, { id, status })
  }
}

export default adminService

