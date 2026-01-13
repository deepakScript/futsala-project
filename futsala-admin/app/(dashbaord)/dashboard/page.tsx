'use client';

import { useEffect, useState } from 'react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import { 
  RevenueLineChart, 
  CourtDoughnutChart, 
  PeakHoursChart 
} from '@/components/dashboard/DashboardCharts';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from '@/lib/axios';
import { Loader2 } from 'lucide-react';

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalVenues: number;
    avgRating: number;
  };
  revenueTrend: Array<{ date: string; amount: number }>;
  courtDistribution: Array<{ name: string; value: number }>;
  peakHours: Array<{ hour: string; count: number }>;
  recentBookings: Array<{
    id: string;
    customer: string;
    court: string;
    date: string;
    time: string;
    amount: number;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/dashboard/stats');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening at your venues.
        </p>
      </div>

      <StatsGrid stats={data.summary} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueLineChart data={data.revenueTrend} />
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-3 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Court Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CourtDoughnutChart data={data.courtDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Peak Booking Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <PeakHoursChart data={data.peakHours} />
          </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <ActivityFeed bookings={data.recentBookings} />
        </div>
      </div>
    </div>
  );
}
