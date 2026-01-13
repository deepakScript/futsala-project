import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Venue {
  id: string
  name: string
  description: string
  address: string
  city: string
  phoneNumber: string
  email: string | null
  images: string[]
  amenities: string[]
  isActive: boolean
  rating: number
  totalReviews: number
  ownerId: string
  createdAt: string
  updatedAt: string
  courts?: any[]
  owner?: {
    id: string
    fullName: string
    email: string
    phoneNumber: string
  }
  _count?: {
    bookings: number
    courts: number
  }
}

interface VenueStats {
  bookings: any[]
  summary: {
    totalBookings: number
    totalRevenue: number
    commission: number
    netOwnerEarnings: number
  }
}

interface VenueState {
  venues: Venue[]
  owners: any[]
  selectedVenue: Venue | null
  venueStats: VenueStats | null
  isLoading: boolean
  error: string | null
  
  fetchVenues: () => Promise<void>
  fetchVenueDetails: (id: string) => Promise<void>
  fetchVenueStats: (id: string) => Promise<void>
  fetchOwners: () => Promise<void>
  createVenue: (data: any) => Promise<void>
  updateVenue: (id: string, data: any) => Promise<void>
  toggleVenueStatus: (id: string, currentStatus: boolean) => Promise<void>
  deleteVenue: (id: string) => Promise<void>
}

const useVenueStore = create<VenueState>((set, get) => ({
  venues: [],
  owners: [],
  selectedVenue: null,
  venueStats: null,
  isLoading: false,
  error: null,

  fetchVenues: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/api/venues')
      set({ venues: response.data.venues, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch venues", isLoading: false })
    }
  },

  fetchOwners: async () => {
    try {
      const response = await axiosInstance.get('/api/users/owners')
      set({ owners: response.data.owners })
    } catch (err: any) {
      console.error("Failed to fetch owners")
    }
  },

  fetchVenueDetails: async (id) => {
    set({ isLoading: true, error: null, selectedVenue: null })
    try {
      const response = await axiosInstance.get(`/api/venues/${id}`)
      set({ selectedVenue: response.data.venue, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch venue details", isLoading: false })
    }
  },

  fetchVenueStats: async (id) => {
    set({ isLoading: true, error: null, venueStats: null })
    try {
      const response = await axiosInstance.get(`/api/venues/${id}/stats`)
      set({ venueStats: response.data, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch venue stats", isLoading: false })
    }
  },

  createVenue: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.post('/api/venues', data)
      get().fetchVenues()
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to create venue", isLoading: false })
      throw err
    }
  },

  updateVenue: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.patch(`/api/venues/${id}`, data)
      get().fetchVenues()
      if (get().selectedVenue?.id === id) {
        get().fetchVenueDetails(id)
      }
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to update venue", isLoading: false })
    }
  },

  toggleVenueStatus: async (id, currentStatus) => {
    try {
      await axiosInstance.patch(`/api/venues/${id}`, { isActive: !currentStatus })
      set((state) => ({
        venues: state.venues.map((v) => 
          v.id === id ? { ...v, isActive: !currentStatus } : v
        )
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to toggle status" })
    }
  },

  deleteVenue: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/api/venues/${id}`)
      set((state) => ({
        venues: state.venues.filter((v) => v.id !== id),
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to delete venue", isLoading: false })
    }
  }
}))

export default useVenueStore
