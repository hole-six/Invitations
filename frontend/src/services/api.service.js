import API_BASE_URL from '../config/api';

/**
 * API Service for Wedding System
 * Uses same authentication pattern as HiWeb_id ERP system
 * - Token stored in localStorage as 'userToken'
 * - Token sent in 'Authorization' header (no "Bearer " prefix)
 * - Automatic token refresh on 401 invalid.token error
 */

class ApiService {
  constructor() {
    // In development, use empty baseURL to leverage Vite proxy
    // In production, use full API URL
    this.baseURL = import.meta.env.DEV ? '' : API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  /**
   * Process queued requests after token refresh
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Get stored auth token
   */
  getAuthToken() {
    return localStorage.getItem('userToken');
  }

  /**
   * Set auth token
   */
  setAuthToken(token) {
    localStorage.setItem('userToken', token);
  }

  /**
   * Remove auth token
   */
  removeAuthToken() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
  }

  /**
   * Main request method with automatic token refresh
   */
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    console.log('🔐 API Request:', {
      endpoint,
      method: options.method || 'GET',
      hasToken: !!token
    });
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header (HiWeb_id pattern - no "Bearer " prefix)
    if (token) {
      headers['Authorization'] = token;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      // Handle 401 invalid.token error (HiWeb_id pattern)
      if (data.code === 401 && data.msg === 'invalid.token' && !endpoint.includes('/user/refresh')) {
        console.log('🔄 Token invalid, attempting refresh...');
        
        // If already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              // Retry with new token
              const newOptions = {
                ...options,
                headers: {
                  ...headers,
                  'Authorization': newToken
                }
              };
              return this.request(endpoint, newOptions);
            })
            .catch((err) => Promise.reject(err));
        }

        // Start refresh process
        this.isRefreshing = true;

        try {
          // Call refresh endpoint (HiWeb_id pattern)
          const refreshResponse = await fetch(`${this.baseURL}/user/refresh`, {
            method: 'GET',
            credentials: 'include' // Send cookies
          });

          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok && refreshData.Authorization) {
            const newToken = refreshData.Authorization;

            // Update stored token
            this.setAuthToken(newToken);

            // Update currentUser object
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser) {
              currentUser.userToken = newToken;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }

            console.log('✅ Token refreshed successfully');

            // Process queued requests
            this.processQueue(null, newToken);

            // Retry original request
            const newOptions = {
              ...options,
              headers: {
                ...headers,
                'Authorization': newToken
              }
            };
            return this.request(endpoint, newOptions);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Process queue with error
          this.processQueue(refreshError, null);

          // Clear auth data
          this.removeAuthToken();

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = null) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const headers = {};
    if (token) {
      headers['Authorization'] = token; // No "Bearer " prefix
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Upload Error:', error);
      throw error;
    }
  }
}

export default new ApiService();
