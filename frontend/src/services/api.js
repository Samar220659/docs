import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

// PayPal API
export const paypalApi = {
  createPayment: async (amount, description) => {
    const response = await api.post('/paypal/create-payment', {
      amount: parseFloat(amount),
      description: description || 'ZZ-Lobby Elite Payment',
    });
    return response.data;
  },
  
  getPayments: async () => {
    const response = await api.get('/paypal/payments');
    return response.data;
  },
};

// Automation API
export const automationApi = {
  getAutomations: async () => {
    const response = await api.get('/automations');
    return response.data;
  },
  
  toggleAutomation: async (automationId, active) => {
    const response = await api.put(`/automations/${automationId}/toggle`, {
      active: active,
    });
    return response.data;
  },
  
  optimizeSystem: async () => {
    const response = await api.post('/automations/optimize');
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
};

// SaaS API
export const saasApi = {
  getStatus: async () => {
    const response = await api.get('/saas/status');
    return response.data;
  },
  
  launchSystem: async () => {
    const response = await api.post('/saas/launch');
    return response.data;
  },
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;