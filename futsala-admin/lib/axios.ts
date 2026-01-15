import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle any future token needs
axiosInstance.interceptors.request.use(
  (config) => {
    // We are using cookies for auth, so axios will send them automatically 
    // if withCredentials is true (though for the same domain it usually works).
    // In Next.js App Router, cookies are automatically sent.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const isAxiosError = axios.isAxiosError;
export default axiosInstance;
