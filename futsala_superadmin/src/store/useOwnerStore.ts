import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Owner {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  isVerified: boolean
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

interface OwnerState {
  owners: Owner[]
  selectedOwner: Owner | null
  ownerPerformance: PerformanceData | null
  isLoading: boolean
  error: string | null
  
  fetchOwners: () => Promise<void>
  fetchOwnerDetails: (id: string) => Promise<void>
  fetchOwnerPerformance: (id: string) => Promise<void>
  updateOwner: (id: string, data: any) => Promise<void>
  resetOwnerPassword: (id: string, newPassword: string) => Promise<void>
  toggleOwnerVerification: (id: string, currentStatus: boolean) => Promise<void>
  deleteOwner: (id: string) => Promise<void>
}

const useOwnerStore = create<OwnerState>((set, get) => ({
  owners: [],
  selectedOwner: null,
  ownerPerformance: null,
  isLoading: false,
  error: null,

  fetchOwners: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/api/owners')
      set({ owners: response.data.owners, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch owners", isLoading: false })
    }
  },

  fetchOwnerDetails: async (id: string) => {
    set({ isLoading: true, error: null, selectedOwner: null })
    try {
      const response = await axiosInstance.get(`/api/owners/${id}`)
      set({ selectedOwner: response.data.owner, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch owner details", isLoading: false })
    }
  },

  fetchOwnerPerformance: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/api/owners/${id}/performance`)
      set({ ownerPerformance: response.data.performance, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch performance stats", isLoading: false })
    }
  },

  updateOwner: async (id: string, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.patch(`/api/owners/${id}`, data)
      const updatedOwner = response.data.owner
      
      set(state => ({
        owners: state.owners.map(o => o.id === id ? { ...o, ...updatedOwner } : o),
        selectedOwner: state.selectedOwner?.id === id ? { ...state.selectedOwner, ...updatedOwner } : state.selectedOwner,
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to update owner", isLoading: false })
      throw err
    }
  },

  resetOwnerPassword: async (id: string, newPassword: string) => {
    return get().updateOwner(id, { newPassword })
  },

  toggleOwnerVerification: async (id: string, currentStatus: boolean) => {
    return get().updateOwner(id, { isVerified: !currentStatus })
  },

  deleteOwner: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/api/owners/${id}`)
      set(state => ({
        owners: state.owners.filter(o => o.id !== id),
        selectedOwner: state.selectedOwner?.id === id ? null : state.selectedOwner,
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to delete owner", isLoading: false })
      throw err
    }
  }
}))

export default useOwnerStore
