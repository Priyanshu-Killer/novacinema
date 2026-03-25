import axios from 'axios'

// Use environment variable in production, fallback to localhost in development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
})

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('nova_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nova_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api