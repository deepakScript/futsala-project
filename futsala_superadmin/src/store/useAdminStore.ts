import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Admin {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  createdAt: string
}

interface AdminState {
  admins: Admin[]
  isLoading: boolean
  error: string | null
  
  fetchAdmins: () => Promise<void>
  createAdmin: (data: any) => Promise<void>
  updateAdmin: (id: string, data: any) => Promise<void>
  deleteAdmin: (id: string) => Promise<void>
}

const useAdminStore = create<AdminState>()((set, get) => ({
  admins: [],
  isLoading: false,
  error: null,

  fetchAdmins: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/admins')
      set({ admins: response.data.admins, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch admins", isLoading: false })
    }
  },

  createAdmin: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.post('/admins', data)
      get().fetchAdmins()
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to create admin", isLoading: false })
      throw err
    }
  },

  updateAdmin: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.patch(`/admins/${id}`, data)
      get().fetchAdmins()
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to update admin", isLoading: false })
      throw err
    }
  },

  deleteAdmin: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/admins/${id}`)
      set((state) => ({
        admins: state.admins.filter((a) => a.id !== id),
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to delete admin", isLoading: false })
      throw err
    }
  }
}))

export default useAdminStore
