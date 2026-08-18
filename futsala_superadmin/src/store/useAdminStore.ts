import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Admin {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  createdAt: string
}

interface CursorPagination {
  nextCursor: string | null
  hasNextPage: boolean
  limit: number
}

interface AdminState {
  admins: Admin[]
  pagination: CursorPagination
  isLoading: boolean
  error: string | null
  
  fetchAdmins: (params?: { cursor?: string; limit?: number; search?: string }) => Promise<void>
  createAdmin: (data: any) => Promise<void>
  updateAdmin: (id: string, data: any) => Promise<void>
  deleteAdmin: (id: string) => Promise<void>
}

const useAdminStore = create<AdminState>()((set, get) => ({
  admins: [],
  pagination: {
    nextCursor: null,
    hasNextPage: false,
    limit: 10,
  },
  isLoading: false,
  error: null,

  fetchAdmins: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const query = new URLSearchParams()
      if (params?.cursor) query.append('cursor', params.cursor)
      if (params?.limit) query.append('limit', String(params.limit))
      if (params?.search) query.append('search', params.search)

      const response = await axiosInstance.get(`/admins?${query.toString()}`)
      set({
        admins: response.data.admins,
        pagination: response.data.pagination,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch admins", isLoading: false })
    }
  },

  createAdmin: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.post('/admins', data)
      await get().fetchAdmins({ limit: get().pagination.limit })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to create admin", isLoading: false })
      throw err
    }
  },

  updateAdmin: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.patch(`/admins/${id}`, data)
      await get().fetchAdmins({ limit: get().pagination.limit })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to update admin", isLoading: false })
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
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to delete admin", isLoading: false })
      throw err
    }
  }
}))

export default useAdminStore
