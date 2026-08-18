import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Transaction {
  id: string
  amount: number
  paymentMethod: string
  transactionId: string | null
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paidAt: string | null
  createdAt: string
  booking: {
    id: string
    user: { fullName: string; email: string }
    court: { venue: { name: string } }
  }
}

interface PaymentStats {
  totalRevenue: number
  totalCommission: number
  totalRefunded: number
  netPlatformRevenue: number
}

interface PayoutInfo {
  venueId: string
  venueName: string
  ownerName: string
  ownerEmail: string
  grossRevenue: number
  commission: number
  netPayout: number
}

interface CursorPagination {
  nextCursor: string | null
  hasNextPage: boolean
  limit: number
}

interface PaymentState {
  transactions: Transaction[]
  pagination: CursorPagination
  stats: PaymentStats | null
  payouts: PayoutInfo[]
  isLoading: boolean
  error: string | null
  
  fetchTransactions: (filters?: {
    status?: string
    method?: string
    cursor?: string
    limit?: number
  }) => Promise<void>
  fetchStats: () => Promise<void>
  fetchPayouts: () => Promise<void>
  processRefund: (bookingId: string) => Promise<void>
}

const usePaymentStore = create<PaymentState>((set, get) => ({
  transactions: [],
  pagination: {
    nextCursor: null,
    hasNextPage: false,
    limit: 10,
  },
  stats: null,
  payouts: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.method) params.append('method', filters.method)
      if (filters?.cursor) params.append('cursor', filters.cursor)
      if (filters?.limit) params.append('limit', String(filters.limit))
      
      const response = await axiosInstance.get(`/payments?${params.toString()}`)
      set({
        transactions: response.data.payments,
        pagination: response.data.pagination,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch transactions", isLoading: false })
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/payments/stats')
      set({ stats: response.data, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch stats", isLoading: false })
    }
  },

  fetchPayouts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/payments/payouts')
      set({ payouts: response.data.payouts, isLoading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch payouts", isLoading: false })
    }
  },

  processRefund: async (bookingId: string) => {
    set({ isLoading: true, error: null })
    try {
      // We use the existing booking PATCH endpoint which handles refund logic
      await axiosInstance.patch(`/bookings/${bookingId}`, { 
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED'
      })
      await get().fetchTransactions()
      await get().fetchStats()
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to process refund", isLoading: false })
      throw err
    }
  }
}))

export default usePaymentStore
