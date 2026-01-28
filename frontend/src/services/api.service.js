import API_BASE_URL from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  setAuthToken(token) {
    localStorage.setItem('auth_token', token);
  }

  removeAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  setRefreshToken(token) {
    localStorage.setItem('refresh_token', token);
  }

  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    // Debug: Log token status
    console.log('🔐 API Request Debug:', {
      endpoint,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
      method: options.method || 'GET'
    });
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.warn('⚠️ No token found in localStorage!');
    }

    const config = {
      ...options,
      headers,
    };

    console.log('📤 Request config:', {
      url: `${this.baseURL}${endpoint}`,
      method: config.method,
      headers: config.headers
    });

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      // If token expired (401), try to refresh
      if (response.status === 401 && this.getRefreshToken() && !endpoint.includes('/auth/refresh')) {
        console.log('🔄 Token expired, attempting refresh...');
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          // Retry original request with new token
          console.log('✅ Token refreshed, retrying request...');
          return this.request(endpoint, options);
        }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async refreshAuthToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('⚠️ No refresh token available');
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.data?.tokens) {
        this.setAuthToken(data.data.tokens.access_token);
        this.setRefreshToken(data.data.tokens.refresh_token);
        console.log('✅ Token refresh successful');
        return true;
      }

      console.error('❌ Token refresh failed');
      this.removeAuthToken();
      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      this.removeAuthToken();
      return false;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
}

export default new ApiService();
