/**
 * API service for AgriChain backend
 */
import axios from 'axios';

// Configure base URL for your Django backend
// Use environment variable or fallback to localhost
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const DEBUG_API = process.env.EXPO_PUBLIC_DEBUG_API === 'true';

// Log the URL being used for debugging (only in development)
if (DEBUG_API) {
  console.log('🔗 API Base URL:', BASE_URL);
}

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (DEBUG_API) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (DEBUG_API) {
      console.error('❌ API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor with fallback
api.interceptors.response.use(
  (response) => {
    if (DEBUG_API) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (DEBUG_API) {
      console.error('❌ API Response Error:', error.response?.data || error.message);
    }

    // Mock data disabled - testing real backend connection
    // if (error.message === 'Network Error' && error.config?.url?.includes('/produces/')) {
    //   console.log('🔄 Using mock data due to network error');
    //   return Promise.resolve({
    //     data: {
    //       count: 1,
    //       results: [
    //         {
    //           id: 1,
    //           blockchain_id: 1,
    //           name: "Organic Tomatoes",
    //           quantity: 100,
    //           price_per_unit_eth: 0.001,
    //           total_price_eth: 0.1,
    //           farmer_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //           is_sold: false,
    //           listed_timestamp: "2025-06-18T17:15:25Z",
    //           created_at: "2025-06-19T13:59:31.807385Z"
    //         }
    //       ]
    //     }
    //   });
    // }

    return Promise.reject(error);
  }
);

/**
 * Produce API endpoints
 */
export const produceAPI = {
  // Get all produces
  getAll: () => api.get('/produces/'),
  
  // Get available produces only
  getAvailable: () => api.get('/produces/available/'),
  
  // Get specific produce by ID
  getById: (id) => api.get(`/produces/${id}/`),
  
  // Create new produce listing
  create: (produceData) => api.post('/produces/', produceData),
  
  // Purchase produce
  purchase: (id, purchaseData) => api.post(`/produces/${id}/purchase/`, purchaseData),
  
  // Sync from blockchain
  syncFromBlockchain: () => api.post('/produces/sync_from_blockchain/'),
  
  // Filter produces
  filter: (params) => api.get('/produces/', { params }),
};

/**
 * Categories API endpoints
 */
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
};

/**
 * User API endpoints
 */
export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profiles/me/'),

  // Update user profile
  updateProfile: (profileData) => api.patch('/users/profiles/me/', profileData),

  // Get transaction history
  getTransactionHistory: (filter = 'all') => {
    const params = filter !== 'all' ? { type: filter } : {};
    return api.get('/users/transactions/', { params });
  },

  // Get farm details
  getFarmDetails: () => api.get('/users/farms/me/'),

  // Update farm details
  updateFarmDetails: (farmData) => api.patch('/users/farms/me/', farmData),
};

/**
 * Utility functions
 */
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  },
  
  // Format price from ETH to display
  formatPrice: (ethPrice) => {
    return parseFloat(ethPrice).toFixed(4);
  },
  
  // Format address for display
  formatAddress: (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
  
  // Format timestamp
  formatTimestamp: (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  },
};

export default api;
