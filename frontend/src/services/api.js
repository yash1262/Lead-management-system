import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api', // Use proxy instead of direct URL
  withCredentials: true, // Important for httpOnly cookies
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

console.log('API Base URL:', process.env.REACT_APP_API_URL || '/api');

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.log('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.log('API Response Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.message = 'Unable to connect to server. Please make sure the backend server is running on port 5000.';
      } else if (error.code === 'TIMEOUT') {
        error.message = 'Request timed out. Please try again.';
      } else {
        error.message = 'Network error. Please check your connection and try again.';
      }
    }
    
    // Handle 401 errors globally (but not for auth/me endpoint)
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      // User is not authenticated, redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls with fallback
export const authAPI = {
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (error) {
      // If the main API fails, try with absolute URL as fallback
      if (!error.response && error.message.includes('Network Error')) {
        console.log('Trying fallback API endpoint...');
        const fallbackApi = axios.create({
          baseURL: 'http://localhost:5000/api',
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        return await fallbackApi.post('/auth/login', credentials);
      }
      throw error;
    }
  },
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

// Leads API calls
export const leadsAPI = {
  getLeads: (params = {}) => {
    const queryString = new URLSearchParams();
    
    // Add pagination params
    if (params.page) queryString.append('page', params.page);
    if (params.limit) queryString.append('limit', params.limit);
    
    // Add filter params
    Object.keys(params).forEach(key => {
      if (key !== 'page' && key !== 'limit' && params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => queryString.append(key, value));
        } else {
          queryString.append(key, params[key]);
        }
      }
    });
    
    return api.get(`/leads?${queryString.toString()}`);
  },
  
  getLead: (id) => api.get(`/leads/${id}`),
  
  createLead: (leadData) => api.post('/leads', leadData),
  
  updateLead: (id, leadData) => api.put(`/leads/${id}`, leadData),
  
  deleteLead: (id) => api.delete(`/leads/${id}`)
};
