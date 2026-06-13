import axios from 'axios'

const BASE_URL = 'https://cpa-backend-main-2nqdmn.laravel.cloud/api'

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
      localStorage.removeItem('user_role')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ─── OFFERS ───────────────────────────────────────────────────────────────────
export const offersAPI = {
  getAll: (params) => api.get('/offers', { params }),
  getById: (id) => api.get(`/offers/${id}`),
  click: (id) => api.post(`/offers/${id}/click`),
}

// ─── WALLET ───────────────────────────────────────────────────────────────────
export const walletAPI = {
  get: () => api.get('/wallet'),
  history: (params) => api.get('/wallet/history', { params }),
}

// ─── WITHDRAW ─────────────────────────────────────────────────────────────────
export const withdrawAPI = {
  getAll: () => api.get('/withdraw'),
  create: (data) => api.post('/withdraw', data),
  getById: (id) => api.get(`/withdraw/${id}`),
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  banUser: (id, data) => api.put(`/admin/users/${id}/ban`, data),
  getWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  approveWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}/approve`, data),
  rejectWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}/reject`, data),
  getPostbacks: (params) => api.get('/admin/postbacks', { params }),
  getFraudLogs: (params) => api.get('/admin/fraud-logs', { params }),
}

export default api