import { LucideIcon, TrendingUp, TrendingDown, Calendar, Home, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, className }: StatsCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn("text-xs mt-1 flex items-center gap-1", trend.isUp ? "text-green-500" : "text-red-500")}>
            {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function StatsGrid({ 
  stats 
}: { 
  stats: { totalRevenue: number, totalBookings: number, totalVenues: number, avgRating: number } 
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total Revenue" 
        value={`Rs. ${stats.totalRevenue.toLocaleString()}`} 
        icon={TrendingUp} 
        trend={{ value: 12, isUp: true }}
      />
      <StatsCard 
        title="Total Bookings" 
        value={stats.totalBookings} 
        icon={Calendar} 
        trend={{ value: 5, isUp: true }}
      />
      <StatsCard 
        title="Active Venues" 
        value={stats.totalVenues} 
        icon={Home} 
      />
      <StatsCard 
        title="Avg. Rating" 
        value={stats.avgRating.toFixed(1)} 
        icon={Star} 
      />
    </div>
  );
}
