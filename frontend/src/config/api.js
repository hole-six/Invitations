// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',

  // Invitations
  INVITATIONS: '/invitations',
  INVITATIONS_FROM_TEMPLATE: '/invitations/from-template',
  INVITATION_DETAIL: (id) => `/invitations/${id}`,
  INVITATION_PUBLISH: (id) => `/invitations/${id}/publish`,
  INVITATION_DUPLICATE: (id) => `/invitations/${id}/duplicate`,
  INVITATION_VERSIONS: (id) => `/invitations/${id}/versions`,
  INVITATION_RESTORE: (id) => `/invitations/${id}/restore`,
  PUBLIC_INVITATION: (slug) => `/public/invitations/${slug}`,

  // Templates
  TEMPLATES: '/templates',
  TEMPLATE_CATEGORIES: '/templates/categories',
  TEMPLATE_DETAIL: (id) => `/templates/${id}`,

  // Guests & RSVP
  INVITATION_GUESTS: (id) => `/invitations/${id}/guests`,
  GUEST_DETAIL: (id) => `/guests/${id}`,
  GUESTS_IMPORT: '/guests/import',
  GUESTS_EXPORT: '/guests/export',
  INVITATION_RSVP: (id) => `/invitations/${id}/rsvp`,

  // Media
  MEDIA: '/media',
  MEDIA_UPLOAD: '/media/upload',
  MEDIA_DELETE: (id) => `/media/${id}`,

  // Analytics
  INVITATION_ANALYTICS: (id) => `/invitations/${id}/analytics`,
  INVITATION_TRACK: (id) => `/invitations/${id}/track`,

  // Subscriptions
  SUBSCRIPTION_PLANS: '/subscriptions/plans',
  SUBSCRIPTION_SUBSCRIBE: '/subscriptions/subscribe',
  SUBSCRIPTION_CURRENT: '/subscriptions/current',
  SUBSCRIPTION_CANCEL: '/subscriptions/cancel',
};

export default API_BASE_URL;
