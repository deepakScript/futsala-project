"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, DollarSign, CalendarCheck } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReportsData {
  growthData: { month: string; users: number; venues: number }[];
  revenueData: { month: string; revenue: number; bookings: number }[];
  venuePerformance: { name: string; totalBookings: number; revenue: number }[];
  cancellationRate: string;
  stats: {
    totalUsers: number;
    totalVenues: number;
    totalRevenue: number;
    totalBookings: number;
  };
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/reports");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load data</div>;

  const  growthChartData = {
    labels: data.growthData.map((d) => d.month),
    datasets: [
      {
        label: "New Users",
        data: data.growthData.map((d) => d.users),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
      {
        label: "New Venues",
        data: data.growthData.map((d) => d.venues),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const revenueChartData = {
    labels: data.revenueData.map((d) => d.month),
    datasets: [
      {
        label: "Revenue (NPR)",
        data: data.revenueData.map((d) => d.revenue),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
      },
    ],
  };

  const bookingTrendsData = {
    labels: data.revenueData.map((d) => d.month),
    datasets: [
        {
            label: "Total Bookings",
            data: data.revenueData.map((d) => d.bookings),
            backgroundColor: "rgba(99, 102, 241, 0.8)", // Indigo
            borderRadius: 4,
        }
    ]
  }

  const cancellationData = {
    labels: ["Completed/Pending", "Cancelled"],
    datasets: [
        {
            data: [100 - parseFloat(data.cancellationRate), parseFloat(data.cancellationRate)],
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
            borderWidth: 1,
        }
    ]
  }

  return (
    <div className="p-8 space-y-8 bg-zinc-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Overview of platform performance and key metrics
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalVenues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NPR {data.stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalBookings}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>
              New users and venues registration over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
                <Line 
                    data={growthChartData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }} 
                />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Cancellation Rate</CardTitle>
            <CardDescription>
                Overview of booking cancellations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center relative">
                <Doughnut 
                    data={cancellationData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{data.cancellationRate}%</div>
                        <div className="text-xs text-muted-foreground">Cancelled</div>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                    Monthly revenue collection
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px]">
                    <Bar 
                        data={revenueChartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                     ticks: {
                                        callback: function(value) {
                                            return 'NPR ' + value;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </CardContent>
        </Card>

         <Card className="col-span-3">
           <CardHeader>
                <CardTitle>Booking Activity</CardTitle>
                <CardDescription>
                    Monthly booking volume
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-[300px]">
                    <Bar 
                        data={bookingTrendsData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
         <Card>
          <CardHeader>
            <CardTitle>Top Performing Venues</CardTitle>
            <CardDescription>
              Venues with highest revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.venuePerformance.map((venue, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{venue.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {venue.totalBookings} bookings
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    NPR {venue.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
              {data.venuePerformance.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                      No data available
                  </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
