import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface DashboardMetrics {
  totalVenues: number
  activeVenueOwners: number
  totalBookings: number
  totalRevenue: number
  todayBookings: number
  pendingApprovals: number
  platformCommission: number
}

interface TopVenue {
  id: string
  name: string
  address: string
  bookingsCount: number
}

interface ChartData {
  bookingTrend: {
    labels: string[]
    values: number[]
  }
  revenueDist: {
    labels: string[]
    values: number[]
  }
}

interface DashboardState {
  metrics: DashboardMetrics | null
  topVenues: TopVenue[]
  charts: ChartData | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
}

const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  topVenues: [],
  charts: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/dashboard/stats')
      set({
        metrics: response.data.metrics,
        topVenues: response.data.topVenues,
        charts: response.data.charts,
        isLoading: false,
      })
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to fetch dashboard data',
        isLoading: false,
      })
    }
  },
}))

export default useDashboardStore
