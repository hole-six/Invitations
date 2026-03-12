const API_URL = import.meta.env.VITE_API_URL || 'https://api.hiweb.vn';

/**
 * Authentication Service for Wedding System
 * Uses same API endpoints as HiWeb_id ERP system
 * - Login: POST /api/v1/user/login
 * - Register: POST /api/v1/user/register
 * - Get User: GET /api/v1/user/me
 * - Refresh: GET /api/v1/user/refresh
 * - Logout: POST /api/v1/user/logout
 * - Token stored as 'userToken' in localStorage
 */

class AuthService {
  /**
   * Register new user
   * Body: { user_name, email, password }
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userData.full_name || userData.name, // API expects 'user_name'
          email: userData.email,
          password: userData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Registration failed');
      }

      if (data && data.Authorization) {
        // Store token in localStorage (same as HiWeb_id)
        localStorage.setItem('userToken', data.Authorization);
        
        // Store user data if available
        if (data.user) {
          const currentUser = {
            ...data.user,
            userToken: data.Authorization
          };
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * Endpoint: POST /api/v1/user/login
   * Body: { user_name, password }
   */
  async login(credentials) {
    try {
      console.log('🔐 Attempting login to:', `${API_URL}/api/v1/user/login`);

      const payload = {
        user_name: credentials.email, // API expects 'user_name' field
        password: credentials.password,
      };

      if (credentials.captchaToken) {
        payload.captcha_token = credentials.captchaToken;
        payload.captcha_provider = credentials.captchaProvider || 'turnstile';
      }

      const response = await fetch(`${API_URL}/api/v1/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      console.log('📥 Login response:', data);

      if (!response.ok) {
        const error = new Error(data.message || data.msg || 'Login failed');
        error.status = response.status;
        error.code = data.code;
        error.data = data.data;
        error.raw = data;
        throw error;
      }

      if (data && data.Authorization) {
        // Remove "Bearer " prefix if present
        const token = data.Authorization.replace('Bearer ', '');
        
        // Store token in localStorage (same as HiWeb_id)
        localStorage.setItem('userToken', token);
        
        // Extract user info from JWT token
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentUser = {
              uuid: payload.uuid || payload.sub,
              user_name: payload.user_name,
              active: payload.active,
              roles: payload.roles || [],
              userToken: token
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('✅ User data extracted from token:', currentUser);
          }
        } catch (e) {
          console.warn('⚠️ Could not parse token payload:', e);
        }
        
        console.log('✅ Login successful, token stored');
      }

      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        await fetch(`${API_URL}/api/v1/user/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/api/v1/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to get user');
      }

      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/refresh`, {
        method: 'GET',
        credentials: 'include' // Send cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const newToken = data.Authorization;

      if (newToken) {
        // Update token in localStorage
        localStorage.setItem('userToken', newToken);

        // Update token in currentUser object
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          currentUser.userToken = newToken;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }

      return newToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear auth data on refresh failure
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to send reset email');
      }

      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, password) {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('userToken');
  }

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem('userToken');
  }

  /**
   * Get stored user
   */
  getUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService();
