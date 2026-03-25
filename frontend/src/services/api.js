import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('novacinema_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    // Only redirect to login on 401 for non-auth endpoints
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      const isAuthCheck = url.includes('/auth/me') || url.includes('/auth/refresh')
      if (!isAuthCheck) {
        localStorage.removeItem('novacinema_token')
        localStorage.removeItem('novacinema_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api