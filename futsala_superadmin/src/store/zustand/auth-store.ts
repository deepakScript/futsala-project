import { create } from 'zustand'
import apiClient from '@/lib/api-client'
import { AxiosError } from 'axios'

interface User {
  id: string
  email: string
  fullName: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: { email: string; password: any }) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setError: (error) => set({ error }),

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { user } = response.data
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      let errorMessage = 'An error occurred during login'
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data.error || errorMessage
      }
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await apiClient.post('/auth/logout')
      set({ user: null, isAuthenticated: false, isLoading: false, error: null })
    } catch (error) {
      set({ isLoading: false })
      console.error('Logout error:', error)
    }
  },
}))
