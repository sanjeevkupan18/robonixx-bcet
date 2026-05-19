import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('robonixx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('robonixx_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── API Service Methods ──────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  stats: () => api.get('/auth/stats'),
  changePassword: (data) => api.put('/auth/change-password', data),
  logoutAll: () => api.post('/auth/logout-all'),
};

export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
  update: (id, data) => api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
  delete: (id) => api.delete(`/events/${id}`),
};

export const membersAPI = {
  getAll: (params) => api.get('/members', { params }),
  getBatches: () => api.get('/members/batches'),
  getOne: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
  update: (id, data) => api.put(`/members/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
  delete: (id) => api.delete(`/members/${id}`),
};

export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  upload: (data) => api.post('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export const contactAPI = {
  send: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  markRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const contentAPI = {
  get: (key) => api.get(`/content/${key}`),
  update: (key, data) => api.put(`/content/${key}`, data),
  uploadImage: (data) => api.post('/content/upload/image', data, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
};

export default api;
