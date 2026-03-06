/**
 * Permission Helper for Wedding System
 * Checks user permissions from ERP token
 */

/**
 * Get user from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get user roles
 */
export const getUserRoles = () => {
  const user = getCurrentUser();
  return user?.roles || [];
};

/**
 * Check if user has specific role
 */
export const hasRole = (roleSlug) => {
  const roles = getUserRoles();
  return roles.some(role => role.slug === roleSlug);
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = () => {
  return hasRole('super_admin');
};

/**
 * Check if user has any wedding template permissions
 */
export const hasWeddingTemplatePermission = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Super admin has all permissions
  if (isSuperAdmin()) return true;
  
  // Check if user has any wedding_template module permissions
  // Permissions are stored in JWT token payload
  const permissions = user.permissions || [];
  return permissions.some(p => p.module === 'wedding_template');
};

/**
 * Check if user has specific wedding permission
 */
export const hasWeddingPermission = (permissionSlug) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Super admin has all permissions
  if (isSuperAdmin()) return true;
  
  // Check specific permission
  const permissions = user.permissions || [];
  return permissions.some(p => p.slug === permissionSlug);
};

/**
 * Check if user can view templates (admin access)
 */
export const canViewTemplates = () => {
  return isSuperAdmin() || hasWeddingPermission('template_view');
};

/**
 * Check if user can create templates
 */
export const canCreateTemplates = () => {
  return isSuperAdmin() || hasWeddingPermission('template_create');
};

/**
 * Check if user can update templates
 */
export const canUpdateTemplates = () => {
  return isSuperAdmin() || hasWeddingPermission('template_update');
};

/**
 * Check if user can delete templates
 */
export const canDeleteTemplates = () => {
  return isSuperAdmin() || hasWeddingPermission('template_delete');
};

/**
 * Check if user can view categories
 */
export const canViewCategories = () => {
  return isSuperAdmin() || hasWeddingPermission('category_view');
};

/**
 * Check if user can manage invitations (view all users' invitations)
 */
export const canManageAllInvitations = () => {
  return isSuperAdmin() || hasWeddingPermission('invitations_update_all') || hasWeddingPermission('invitations_delete_all');
};

/**
 * Check if user has admin access (can access admin pages)
 */
export const hasAdminAccess = () => {
  return isSuperAdmin() || 
         hasWeddingTemplatePermission() || 
         canManageAllInvitations();
};

/**
 * Get redirect path after login based on user permissions
 */
export const getRedirectPathAfterLogin = () => {
  if (hasAdminAccess()) {
    return '/dashboard';
  }
  return '/';
};
