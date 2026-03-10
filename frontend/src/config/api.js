// API Configuration - New ERP Integration Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wedding.hiweb.vn';

export const API_ENDPOINTS = {
  // Auth (giữ nguyên nếu backend có)
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',

  // Categories - NEW API v1
  CATEGORIES: '/api/v1/wedding/categories',
  CATEGORY_CREATE: '/api/v1/wedding/categories',
  CATEGORY_UPDATE: '/api/v1/wedding/categories',
  CATEGORY_DELETE: '/api/v1/wedding/categories',

  // Templates - NEW API v1
  TEMPLATES: '/api/v1/wedding/templates',
  TEMPLATE_CREATE: '/api/v1/wedding/templates',
  TEMPLATE_UPDATE: '/api/v1/wedding/templates',
  TEMPLATE_DELETE: '/api/v1/wedding/templates',
  TEMPLATE_CATEGORIES: '/api/v1/wedding/categories', // Same as categories
  TEMPLATE_DETAIL: (id) => `/api/v1/wedding/templates/${id}`,

  // Invitations - NEW API v1
  INVITATIONS: '/api/v1/wedding/invitations',
  INVITATIONS_FROM_TEMPLATE: '/api/v1/wedding/invitations',
  INVITATION_CREATE: '/api/v1/wedding/invitations',
  INVITATION_UPDATE: '/api/v1/wedding/invitations',
  INVITATION_DELETE: '/api/v1/wedding/invitations',
  INVITATION_DETAIL: (id) => `/api/v1/wedding/invitations/${id}`,
  
  // Trial Publication - NEW
  INVITATION_PUBLISH_TRIAL: (id) => `/api/invitations/${id}/publish-trial`,
  INVITATION_CONFIRM_TRIAL: (id) => `/api/invitations/${id}/confirm-trial`,
  INVITATION_TRIAL_STATUS: (id) => `/api/invitations/${id}/trial-status`,
  
  // Legacy publish (nếu còn dùng)
  INVITATION_PUBLISH: (id) => `/invitations/${id}/publish`,
  INVITATION_DUPLICATE: (id) => `/invitations/${id}/duplicate`,
  INVITATION_VERSIONS: (id) => `/invitations/${id}/versions`,
  INVITATION_RESTORE: (id) => `/invitations/${id}/restore`,

  // Public Access - NEW
  PUBLIC_INVITATION: (slug) => `/api/public/invitations/${slug}`,

  // Admin - NEW API v1
  ADMIN_INVITATIONS: '/api/admin/invitations',
  ADMIN_STATS: '/api/admin/dashboard/stats', // Fix: Use correct endpoint


  // Guests & RSVP (giữ nguyên nếu backend có)
  INVITATION_GUESTS: (id) => `/invitations/${id}/guests`,
  GUEST_DETAIL: (id) => `/guests/${id}`,
  GUESTS_IMPORT: '/guests/import',
  GUESTS_EXPORT: '/guests/export',
  INVITATION_RSVP: (id) => `/invitations/${id}/rsvp`,

  // Media (giữ nguyên nếu backend có)
  MEDIA: '/media',
  MEDIA_UPLOAD: '/media/upload',
  MEDIA_DELETE: (id) => `/media/${id}`,

  // Analytics (giữ nguyên nếu backend có)
  INVITATION_ANALYTICS: (id) => `/invitations/${id}/analytics`,
  INVITATION_TRACK: (id) => `/invitations/${id}/track`,

  // Subscriptions (giữ nguyên nếu backend có)
  SUBSCRIPTION_PLANS: '/subscriptions/plans',
  SUBSCRIPTION_SUBSCRIBE: '/subscriptions/subscribe',
  SUBSCRIPTION_CURRENT: '/subscriptions/current',
  SUBSCRIPTION_CANCEL: '/subscriptions/cancel',
};

export default API_BASE_URL;
