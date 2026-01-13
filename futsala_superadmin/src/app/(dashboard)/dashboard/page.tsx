"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  MapPin, 
  CalendarCheck, 
  DollarSign, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  Loader2
} from "lucide-react"
import DashboardCharts from "./DashboardCharts"
import useDashboardStore from "@/store/useDashboardStore"

export default function DashboardPage() {
  const { metrics, topVenues, charts, isLoading, error, fetchStats } = useDashboardStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (isLoading && !metrics) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        Error: {error}
      </div>
    )
  }

  if (!metrics || !charts) return null

  const stats = [
    {
      title: "Total Venues",
      value: metrics.totalVenues.toString(),
      icon: MapPin,
      description: "Registered in platform",
    },
    {
      title: "Active Venue Owners",
      value: metrics.activeVenueOwners.toString(),
      icon: ShieldCheck,
      description: "Verified owners",
    },
    {
      title: "Total Bookings",
      value: metrics.totalBookings.toString(),
      icon: CalendarCheck,
      description: "All-time bookings",
    },
    {
      title: "Total Revenue (Platform)",
      value: `Rs. ${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total transaction volume",
    },
    {
      title: "Today's Bookings",
      value: metrics.todayBookings.toString(),
      icon: Clock,
      description: "New bookings today",
    },
    {
      title: "Pending Approvals",
      value: metrics.pendingApprovals.toString(),
      icon: TrendingUp,
      description: "Venues awaiting check",
    },
    {
      title: "Platform Commission",
      value: `Rs. ${metrics.platformCommission.toLocaleString()}`,
      icon: DollarSign,
      description: "10% of total revenue",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back, Admin. Here's what's happening across the platform.
          </p>
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts bookingData={charts.bookingTrend} revenueData={charts.revenueDist} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Performing Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
               {topVenues.map((venue) => (
                 <div key={venue.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{venue.name}</p>
                      <p className="text-xs text-muted-foreground">{venue.address}</p>
                    </div>
                    <div className="ml-auto font-medium">
                      {venue.bookingsCount} bookings
                    </div>
                 </div>
               ))}
               {topVenues.length === 0 && (
                 <div className="text-center py-4 text-muted-foreground">
                    No venue data available yet.
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm">Database Status</span>
                 <span className="text-sm font-bold text-green-500">Connected</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm">Store Sync</span>
                 <span className="text-sm font-bold text-blue-500">Active</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm">API Latency</span>
                 <span className="text-sm font-bold text-green-500">Healthy</span>
               </div>
               <button 
                 onClick={() => fetchStats()}
                 className="w-full mt-4 text-xs bg-muted hover:bg-muted/80 p-2 rounded transition-colors"
               >
                 Refresh Global State
               </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}