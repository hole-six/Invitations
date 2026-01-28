import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

class AuthService {
  async register(userData) {
    const response = await apiService.post(API_ENDPOINTS.AUTH_REGISTER, userData);
    if (response.data?.tokens) {
      apiService.setAuthToken(response.data.tokens.access_token);
      apiService.setRefreshToken(response.data.tokens.refresh_token);
    } else if (response.data?.token) {
      // Fallback for old format
      apiService.setAuthToken(response.data.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await apiService.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
    if (response.data?.tokens) {
      apiService.setAuthToken(response.data.tokens.access_token);
      apiService.setRefreshToken(response.data.tokens.refresh_token);
    } else if (response.data?.token) {
      // Fallback for old format
      apiService.setAuthToken(response.data.token);
    }
    return response;
  }

  async logout() {
    try {
      await apiService.post(API_ENDPOINTS.AUTH_LOGOUT);
    } finally {
      apiService.removeAuthToken();
    }
  }

  async getCurrentUser() {
    return apiService.get(API_ENDPOINTS.AUTH_ME);
  }

  async forgotPassword(email) {
    return apiService.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  }

  async resetPassword(token, password) {
    return apiService.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { token, password });
  }

  isAuthenticated() {
    return !!apiService.getAuthToken();
  }
}

export default new AuthService();
