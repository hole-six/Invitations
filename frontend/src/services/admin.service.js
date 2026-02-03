import apiService from './api.service'

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    return apiService.get('/admin/dashboard/stats')
  },

  // User Management
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.role && filters.role !== 'all') params.append('role', filters.role)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder)

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

  // Invitation Management
  getAllInvitations: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.userId && filters.userId !== 'all') params.append('user_id', filters.userId)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder)

    const query = params.toString()
    return apiService.get(`/invitations${query ? '?' + query : ''}`)
  },

  getAllUsers: async () => {
    return apiService.get('/invitations/users')
  },

  updateInvitationStatus: async (id, status) => {
    return apiService.put(`/admin/invitations/${id}/status`, { status })
  },

  deleteInvitation: async (id) => {
    return apiService.delete(`/admin/invitations/${id}`)
  },

  // Template Management
  getAllTemplates: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder)

    const query = params.toString()
    return apiService.get(`/admin/templates${query ? '?' + query : ''}`)
  },

  updateTemplateStatus: async (id, status) => {
    return apiService.put(`/admin/templates/${id}/status`, { status })
  }
}

export default adminService
