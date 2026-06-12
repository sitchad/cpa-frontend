import axios from 'axios'

const BASE_URL = 'https://cpa-backend-main-2nqdmn.laravel.cloud'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Request interceptor: injecte le Bearer Token automatiquement ─────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: gère les 401 (token expiré / invalide) ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
}

// ─── OFFERS ───────────────────────────────────────────────────────────────────
export const offersAPI = {
  getAll: (params) => api.get('/api/offers', { params }),
  getById: (id) => api.get(`/api/offers/${id}`),
  click: (id) => api.post(`/api/offers/${id}/click`),
}

// ─── WALLET ───────────────────────────────────────────────────────────────────
export const walletAPI = {
  get: () => api.get('/api/wallet'),
  history: (params) => api.get('/api/wallet/history', { params }),
}

// ─── WITHDRAW ─────────────────────────────────────────────────────────────────
export const withdrawAPI = {
  getAll: () => api.get('/api/withdraw'),
  create: (data) => api.post('/api/withdraw', data),
  getById: (id) => api.get(`/api/withdraw/${id}`),
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  banUser: (id) => api.put(`/api/admin/users/${id}/ban`),
  getWithdrawals: () => api.get('/api/admin/withdrawals'),
  approveWithdrawal: (id) => api.put(`/api/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id) => api.put(`/api/admin/withdrawals/${id}/reject`),
  getPostbacks: () => api.get('/api/admin/postbacks'),
  getFraudLogs: () => api.get('/api/admin/fraud-logs'),
}

export default api
