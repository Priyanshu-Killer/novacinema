import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
})

// Attach token — key is novacinema_token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('novacinema_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('novacinema_token')
      localStorage.removeItem('novacinema_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api