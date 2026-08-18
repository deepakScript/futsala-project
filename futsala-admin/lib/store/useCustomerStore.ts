import { create } from 'zustand'
import axiosInstance, { isAxiosError } from '@/lib/axios'

export interface Customer {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  totalBookings: number
  totalSpent: number
  lastBookingDate?: string
}

export interface CursorPagination {
  nextCursor: string | null
  hasNextPage: boolean
  limit: number
}

interface CustomerState {
  customers: Customer[]
  pagination: CursorPagination
  isLoading: boolean
  error: string | null

  fetchCustomers: (params?: { cursor?: string; limit?: number; search?: string }) => Promise<void>
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  pagination: {
    nextCursor: null,
    hasNextPage: false,
    limit: 10,
  },
  isLoading: false,
  error: null,

  fetchCustomers: async (params?: { cursor?: string; limit?: number; search?: string }) => {
    set({ isLoading: true, error: null })
    try {
      const query = new URLSearchParams()
      if (params?.cursor) query.append('cursor', params.cursor)
      if (params?.limit) query.append('limit', String(params.limit))
      if (params?.search) query.append('search', params.search)

      let customers: Customer[] = []
      let pagination: CursorPagination = {
        nextCursor: null,
        hasNextPage: false,
        limit: params?.limit || get().pagination.limit,
      }

      try {
        const response = await axiosInstance.get(`/customers?${query.toString()}`)
        customers = response.data.customers || []
        pagination = response.data.pagination || pagination
      } catch {
        // Fallback: derive customer list from bookings endpoint if customer route doesn't exist
        const bookingsRes = await axiosInstance.get('/bookings')
        const bookings = bookingsRes.data.bookings || []
        const customerMap = new Map<string, Customer>()

        bookings.forEach((b: any) => {
          if (!b.user) return
          const email = b.user.email || b.user.fullName
          const existing = customerMap.get(email) || {
            id: b.user.id || email,
            fullName: b.user.fullName || 'Unknown',
            email: b.user.email || 'N/A',
            phoneNumber: b.user.phoneNumber || 'N/A',
            totalBookings: 0,
            totalSpent: 0,
            lastBookingDate: b.bookingDate,
          }

          existing.totalBookings += 1
          existing.totalSpent += b.totalPrice || 0
          if (new Date(b.bookingDate) > new Date(existing.lastBookingDate || 0)) {
            existing.lastBookingDate = b.bookingDate
          }
          customerMap.set(email, existing)
        })

        let list = Array.from(customerMap.values())
        if (params?.search) {
          const s = params.search.toLowerCase()
          list = list.filter((c) => c.fullName.toLowerCase().includes(s) || c.email.toLowerCase().includes(s))
        }
        customers = list
      }

      set({ customers, pagination, isLoading: false })
    } catch (err: any) {
      let message = 'Failed to load customers'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      set({ error: message, isLoading: false })
    }
  },
}))

export default useCustomerStore
