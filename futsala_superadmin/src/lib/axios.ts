import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptors if needed (e.g., for auth tokens)
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add logic here to inject tokens from local storage or cookies
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInstance
