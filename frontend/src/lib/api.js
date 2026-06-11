import axios from 'axios'

// In dev, Vite proxies /api → localhost:4000.
// In production, set VITE_API_URL to the deployed backend URL (e.g. https://twin-lakes-api.vercel.app).
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tl_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => {
    window.dispatchEvent(new Event('api:online'))
    return r
  },
  err => {
    if (!err.response) {
      // Network error — backend is offline
      window.dispatchEvent(new Event('api:offline'))
    } else if (err.response.status === 401) {
      localStorage.removeItem('tl_token')
      localStorage.removeItem('tl_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
