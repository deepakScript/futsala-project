import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axiosInstance from '@/lib/axios'

interface User {
  id: string
  email: string
  fullName: string
  role: 'SUPERADMIN' | 'ADMIN' | 'VENUE_OWNER' | 'CUSTOMER'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  setAuth: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axiosInstance.post('/auth/login', credentials)
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (err: any) {
          const errorMessage = 
            err.response?.data?.message || 
            err.response?.data?.error || 
            err.message || 
            'Login failed'
          set({ 
            error: errorMessage, 
            isLoading: false 
          })
          throw new Error(errorMessage)
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await axiosInstance.post('/auth/logout')
        } catch (err) {
          console.error('Logout API call failed:', err)
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          })
        }
      },

      setAuth: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
