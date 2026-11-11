import axios from 'axios'
import { mockAdapter } from '../mock/server'

// Static demo: there is no backend or database. Every request is answered
// in the browser by the mock API in src/mock (seeded demo records).
const api = axios.create({ baseURL: '/api', adapter: mockAdapter })

api.interceptors.response.use(
  r => {
    window.dispatchEvent(new Event('api:online'))
    return r
  },
  err => Promise.reject(err)
)

export default api
