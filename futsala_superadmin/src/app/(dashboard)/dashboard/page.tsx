import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Users, MapPin, CalendarCheck } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Venues",
      value: "12",
      icon: MapPin,
      description: "+2 from last month",
    },
    {
      title: "Active Bookings",
      value: "48",
      icon: CalendarCheck,
      description: "15 bookings today",
    },
    {
      title: "Total Users",
      value: "124",
      icon: Users,
      description: "+18% from last month",
    },
    {
      title: "Page Views",
      value: "1,234",
      icon: LayoutDashboard,
      description: "Last 7 days",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome back, Admin. Here's what's happening today.
        </p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
              No recent activity to display.
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-md bg-muted" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Futsal Arena {i}</p>
                      <p className="text-xs text-muted-foreground">{20 + i} bookings</p>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}