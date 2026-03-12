import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        // Try to get stored user first (HiWeb_id pattern)
        const storedUser = authService.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
        
        // Then fetch fresh user data
        try {
          const data = await authService.getCurrentUser();
          if (data?.user) {
            setUser(data.user);
            // Update stored user
            const currentUser = {
              ...data.user,
              userToken: authService.getToken()
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
        } catch (err) {
          console.error('Failed to fetch fresh user data:', err);
          // Keep using stored user if API call fails
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // Don't clear token - let user stay logged in with stored token
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authService.login(credentials);
      
      // Get user from localStorage (extracted from token)
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }

      console.log('Login successful, user data:', storedUser);
      
      return { data }; // Return in expected format for LoginPage
    } catch (err) {
      const isCaptchaRequired =
        err?.code === 428 ||
        err?.status === 428 ||
        err?.raw?.code === 428 ||
        err?.raw?.msg === 'captcha.required' ||
        err?.message === 'captcha.required';
      const errorMessage =
        err?.raw?.message ||
        err?.raw?.msg ||
        err?.message ||
        'Login failed. Please try again.';
      setError(isCaptchaRequired ? 'Vui lòng xác minh CAPTCHA để tiếp tục.' : errorMessage);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      
      // Store user data (HiWeb_id format)
      if (data?.user) {
        setUser(data.user);
      }
      
      return { data }; // Return in expected format for RegisterPage
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.msg || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      // authService.logout() already clears localStorage
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
