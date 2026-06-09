import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example API calls
export const api = {
  // Products
  getProducts: () => apiClient.get('/api/products'),
  getProduct: (id: string) => apiClient.get(`/api/products/${id}`),
  createProduct: (data: any) => apiClient.post('/api/products', data),
  updateProduct: (id: string, data: any) => apiClient.put(`/api/products/${id}`, data),
  deleteProduct: (id: string) => apiClient.delete(`/api/products/${id}`),

  // Users
  getUsers: () => apiClient.get('/api/users'),
  getUser: (id: string) => apiClient.get(`/api/users/${id}`),
  createUser: (data: any) => apiClient.post('/api/users', data),

  // Orders
  getOrders: () => apiClient.get('/api/orders'),
  getOrder: (id: string) => apiClient.get(`/api/orders/${id}`),
  createOrder: (data: any) => apiClient.post('/api/orders', data),
};

export default apiClient;
