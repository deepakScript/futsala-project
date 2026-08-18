import { create } from 'zustand'
import axiosInstance, { isAxiosError } from '@/lib/axios'

export interface Court {
  id?: string
  name: string
  pricePerHour: number
}

export interface Venue {
  id: string
  name: string
  address: string
  phoneNumber: string
  description: string
  amenities: string[]
  images: string[]
  courts: Court[]
}

interface VenueState {
  venue: Venue | null
  isLoading: boolean
  isSaving: boolean
  error: string | null

  fetchVenue: () => Promise<void>
  updateVenue: (data: Partial<Venue>) => Promise<void>
  uploadImage: (file: File) => Promise<string>
  setVenue: (venue: Venue | null) => void
}

export const useVenueStore = create<VenueState>((set, get) => ({
  venue: null,
  isLoading: false,
  isSaving: false,
  error: null,

  setVenue: (venue: Venue | null) => set({ venue }),

  fetchVenue: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/venues')
      set({ venue: response.data, isLoading: false })
    } catch (err: any) {
      let message = 'Failed to load venue information'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      set({ error: message, isLoading: false })
    }
  },

  updateVenue: async (data: Partial<Venue>) => {
    const currentVenue = get().venue
    if (!currentVenue) return

    set({ isSaving: true, error: null })
    try {
      const payload = { ...currentVenue, ...data }
      const response = await axiosInstance.patch('/venues', payload)
      set({ venue: response.data || payload, isSaving: false })
    } catch (err: any) {
      let message = 'Failed to update venue'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      set({ error: message, isSaving: false })
      throw new Error(message)
    }
  },

  uploadImage: async (file: File) => {
    const currentVenue = get().venue
    if (!currentVenue) throw new Error('No venue loaded')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('venueId', currentVenue.id)

    try {
      const response = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const imageUrl = response.data.url
      const updatedImages = [...currentVenue.images, imageUrl]
      set({ venue: { ...currentVenue, images: updatedImages } })
      return imageUrl
    } catch (err: any) {
      let message = 'Failed to upload image'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      throw new Error(message)
    }
  },
}))

export default useVenueStore
