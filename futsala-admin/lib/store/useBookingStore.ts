import { create } from 'zustand'
import axiosInstance, { isAxiosError } from '@/lib/axios'

export interface BookingUser {
  fullName: string
  email: string
  phoneNumber: string
}

export interface BookingCourt {
  name: string
  venue: {
    name: string
  }
}

export interface Booking {
  id: string
  bookingDate: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  paymentStatus: string
  otp?: string
  user: BookingUser
  court: BookingCourt
}

export interface BookingStatsData {
  totalToday: number
  pendingApprovals: number
  revenue: number
}

export interface CursorPagination {
  nextCursor: string | null
  hasNextPage: boolean
  limit: number
}

interface BookingParams {
  cursor?: string
  limit?: number
  search?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface BookingState {
  bookings: Booking[]
  stats: BookingStatsData | null
  pagination: CursorPagination
  isLoading: boolean
  error: string | null

  fetchBookings: (params?: BookingParams) => Promise<void>
  updateBookingStatus: (id: string, status: string) => Promise<void>
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  stats: null,
  pagination: {
    nextCursor: null,
    hasNextPage: false,
    limit: 10,
  },
  isLoading: false,
  error: null,

  fetchBookings: async (params?: BookingParams) => {
    set({ isLoading: true, error: null })
    try {
      const query = new URLSearchParams()
      if (params?.cursor) query.append('cursor', params.cursor)
      if (params?.limit) query.append('limit', String(params.limit))
      if (params?.search) query.append('search', params.search)
      if (params?.status) query.append('status', params.status)
      if (params?.startDate) query.append('startDate', params.startDate)
      if (params?.endDate) query.append('endDate', params.endDate)

      const response = await axiosInstance.get(`/bookings?${query.toString()}`)
      const data = response.data

      set({
        bookings: data.bookings || [],
        stats: data.stats || null,
        pagination: data.pagination || {
          nextCursor: null,
          hasNextPage: false,
          limit: params?.limit || get().pagination.limit,
        },
        isLoading: false,
      })
    } catch (err: any) {
      let message = 'Failed to fetch bookings'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      set({ error: message, isLoading: false })
    }
  },

  updateBookingStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.patch('/bookings', { bookingId: id, status })
      await get().fetchBookings({ limit: get().pagination.limit })
    } catch (err: any) {
      let message = 'Failed to update booking status'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },
}))

export default useBookingStore
