/**
 * Jesko — Axios API Service
 * Centralized HTTP client with JWT token injection.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jesko_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jesko_token');
      localStorage.removeItem('jesko_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// ── Cars ─────────────────────────────────────
export const carsAPI = {
  search: (params) => api.get('/cars', { params }),
  getMyCars: () => api.get('/cars/my'),
  getById: (id) => api.get(`/cars/${id}`),
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}`),
};

// ── Drivers ──────────────────────────────────
export const driversAPI = {
  list: (params) => api.get('/drivers', { params }),
  register: (data) => api.post('/drivers/register', data),
  getMe: () => api.get('/drivers/me'),
  getById: (id) => api.get(`/drivers/${id}`),
  updateMe: (data) => api.put('/drivers/me', data),
};

// ── Bookings ─────────────────────────────────
export const bookingsAPI = {
  list: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

// ── Payments ─────────────────────────────────
export const paymentsAPI = {
  process: (data) => api.post('/payments', data),
  getByBooking: (bookingId) => api.get(`/payments/${bookingId}`),
};

// ── Reviews ──────────────────────────────────
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getCarReviews: (carId) => api.get(`/reviews/car/${carId}`),
  getDriverReviews: (driverId) => api.get(`/reviews/driver/${driverId}`),
};

// ── AI ───────────────────────────────────────
export const aiAPI = {
  getRecommendations: (data) => api.post('/ai/recommendations', data),
  predictDemand: (data) => api.post('/ai/demand', data),
  getDriverScore: (driverId) => api.get(`/ai/driver-score/${driverId}`),
  detectDamage: () => api.post('/ai/damage-detection'),
};

// ── Chatbot ──────────────────────────────────
export const chatAPI = {
  send: (data) => api.post('/chat', data),
};

// ── Admin ────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  verifyDriver: (id) => api.patch(`/admin/drivers/${id}/verify`),
};

export default api;
