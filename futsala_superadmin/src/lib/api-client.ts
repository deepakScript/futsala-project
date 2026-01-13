import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Optional: Add interceptors for token management if needed in the future
// apiClient.interceptors.request.use((config) => { ... })

export default apiClient
