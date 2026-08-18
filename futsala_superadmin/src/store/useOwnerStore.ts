import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Owner {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  createdAt: string
  _count?: {
    venues: number
  }
  venues?: any[]
}

interface PerformanceData {
  totalRevenue: number
  totalBookings: number
  platformCommission: number
  netOwnerEarnings: number
  venueBreakdown: any[]
}

interface CursorPagination {
  nextCursor: string | null
  hasNextPage: boolean
  limit: number
}

interface OwnerState {
  owners: Owner[]
  pagination: CursorPagination
  selectedOwner: Owner | null
  ownerPerformance: PerformanceData | null
  isLoading: boolean
  error: string | null
  
  fetchOwners: (params?: { cursor?: string; limit?: number; search?: string }) => Promise<void>
  fetchOwnerDetails: (id: string) => Promise<void>
  fetchOwnerPerformance: (id: string) => Promise<void>
  createOwner: (data: any) => Promise<void>
  updateOwner: (id: string, data: any) => Promise<void>
  resetOwnerPassword: (id: string, newPassword: string) => Promise<void>
  deleteOwner: (id: string) => Promise<void>
}

const useOwnerStore = create<OwnerState>((set, get) => ({
  owners: [],
  pagination: {
    nextCursor: null,
    hasNextPage: false,
    limit: 10,
  },
  selectedOwner: null,
  ownerPerformance: null,
  isLoading: false,
  error: null,

  fetchOwners: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const query = new URLSearchParams()
      if (params?.cursor) query.append('cursor', params.cursor)
      if (params?.limit) query.append('limit', String(params.limit))
      if (params?.search) query.append('search', params.search)

      const response = await axiosInstance.get(`/owners?${query.toString()}`)
      set({
        owners: response.data.owners,
        pagination: response.data.pagination,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch owners", isLoading: false })
    }
  },

  createOwner: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.post('/owners', data)
      await get().fetchOwners({ limit: get().pagination.limit })
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to create owner"
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  },

  fetchOwnerDetails: async (id: string) => {
    set({ isLoading: true, error: null, selectedOwner: null })
    try {
      const response = await axiosInstance.get(`/owners/${id}`)
      set({ selectedOwner: response.data.owner, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch owner details", isLoading: false })
    }
  },

  fetchOwnerPerformance: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/owners/${id}/performance`)
      set({ ownerPerformance: response.data.performance, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch performance stats", isLoading: false })
    }
  },

  updateOwner: async (id: string, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.patch(`/owners/${id}`, data)
      const updatedOwner = response.data.owner
      
      set(state => ({
        owners: state.owners.map(o => o.id === id ? { ...o, ...updatedOwner } : o),
        selectedOwner: state.selectedOwner?.id === id ? { ...state.selectedOwner, ...updatedOwner } : state.selectedOwner,
        isLoading: false
      }))
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to update owner"
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  },

  resetOwnerPassword: async (id: string, newPassword: string) => {
    return get().updateOwner(id, { newPassword })
  },

  deleteOwner: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/owners/${id}`)
      set(state => ({
        owners: state.owners.filter(o => o.id !== id),
        selectedOwner: state.selectedOwner?.id === id ? null : state.selectedOwner,
        isLoading: false
      }))
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to delete owner"
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  }
}))

export default useOwnerStore
