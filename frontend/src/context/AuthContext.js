import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.log('Auth check failed:', error.response?.status, error.response?.data?.message);
      
      // If it's a 401 (unauthorized), that's expected when not logged in
      if (error.response?.status === 401) {
        // Check localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUser(user);
          } catch (err) {
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        // For other errors (network, server errors), still check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUser(user);
          } catch (err) {
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError('');
    setLoading(true);
    
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      } else {
        throw new Error('No user data in response');
      }
    } catch (error) {
      let message = 'Login failed';
      
      if (!error.response) {
        // Network error
        if (error.message.includes('Unable to connect to server')) {
          message = 'Unable to connect to server. Please make sure the backend server is running on port 5000.';
        } else if (error.message.includes('Request timed out')) {
          message = 'Request timed out. Please try again.';
        } else {
          message = 'Network error. Please check your connection and try again.';
        }
      } else {
        // Server responded with error
        message = error.response?.data?.message || error.message || 'Login failed';
      }
      
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError('');
    setLoading(true);
    
    try {
      const response = await authAPI.register(userData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!user
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};