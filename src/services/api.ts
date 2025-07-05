const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API utility functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'API request failed');
    }
  
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData: any) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

// Stock API
export const stockAPI = {
  getAll: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/stock${queryString}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/stock/${id}`);
  },

  create: async (stockData: any) => {
    return apiRequest('/stock', {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
  },

  update: async (id: string, stockData: any) => {
    return apiRequest(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/stock/${id}`, {
      method: 'DELETE',
    });
  },

  getLowStock: async () => {
    return apiRequest('/stock/alerts/low-stock');
  },

  updateQuantity: async (id: string, quantity: number, operation: 'add' | 'subtract') => {
    return apiRequest(`/stock/${id}/quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, operation }),
    });
  },
};

// Staff API
export const staffAPI = {
  getAll: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/staff${queryString}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/staff/${id}`);
  },

  create: async (staffData: any) => {
    return apiRequest('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  update: async (id: string, staffData: any) => {
    return apiRequest(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/staff/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return apiRequest('/staff/stats/overview');
  },
};

// Customer API
export const customerAPI = {
  getAll: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/customers${queryString}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/customers/${id}`);
  },

  create: async (customerData: any) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  update: async (id: string, customerData: any) => {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getStats: async () => {
    return apiRequest('/customers/stats/overview');
  },
};

// Transaction API
export const transactionAPI = {
  getAll: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/transactions${queryString}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/transactions/${id}`);
  },

  create: async (transactionData: any) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  approve: async (id: string) => {
    return apiRequest(`/transactions/${id}/approve`, {
      method: 'PATCH',
    });
  },

  reject: async (id: string) => {
    return apiRequest(`/transactions/${id}/reject`, {
      method: 'PATCH',
    });
  },

  complete: async (id: string) => {
    return apiRequest(`/transactions/${id}/complete`, {
      method: 'PATCH',
    });
  },

  getStats: async () => {
    return apiRequest('/transactions/stats/overview');
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiRequest('/dashboard/stats');
  },

  getTrends: async () => {
    return apiRequest('/dashboard/trends');
  },

  getPerformance: async () => {
    return apiRequest('/dashboard/performance');
  },
};