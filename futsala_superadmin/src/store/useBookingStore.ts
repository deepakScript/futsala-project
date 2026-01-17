import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Booking {
  id: string
  userId: string
  courtId: string
  bookingDate: string
  startTime: string
  endTime: string
  totalHours: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  otp?: string | null
  notes: string | null
  createdAt: string
  user: {
    fullName: string
    email: string
    phoneNumber: string
  }
  court: {
    name: string
    venue: {
      id: string
      name: string
      address: string
    }
  }
  payment?: {
    id: string
    status: string
    paymentMethod: string
    transactionId: string | null
  }
}

interface BookingState {
  bookings: Booking[]
  isLoading: boolean
  error: string | null
  
  fetchBookings: (filters?: { venueId?: string, status?: string, date?: string }) => Promise<void>
  updateBooking: (id: string, data: { status?: string, paymentStatus?: string, notes?: string }) => Promise<void>
  cancelBooking: (id: string) => Promise<void>
  refundBooking: (id: string) => Promise<void>
  deleteBooking: (id: string) => Promise<void>
}

const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (filters?.venueId) params.append('venueId', filters.venueId)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.date) params.append('date', filters.date)

      const response = await axiosInstance.get(`/api/bookings?${params.toString()}`)
      set({ bookings: response.data.bookings, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch bookings", isLoading: false })
    }
  },

  updateBooking: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.patch(`/api/bookings/${id}`, data)
      const updatedBooking = response.data.booking
      set(state => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, ...updatedBooking } : b),
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to update booking", isLoading: false })
      throw err
    }
  },

  cancelBooking: async (id) => {
    return get().updateBooking(id, { status: 'CANCELLED' })
  },

  refundBooking: async (id) => {
    return get().updateBooking(id, { paymentStatus: 'REFUNDED', status: 'CANCELLED' })
  },

  deleteBooking: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/api/bookings/${id}`)
      set(state => ({
        bookings: state.bookings.filter(b => b.id !== id),
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to delete booking", isLoading: false })
      throw err
    }
  }
}))

export default useBookingStore
