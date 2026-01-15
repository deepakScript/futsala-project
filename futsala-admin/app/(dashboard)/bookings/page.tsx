'use client';

import { useEffect, useState } from 'react';
import axios, { isAxiosError } from '@/lib/axios';
import BookingStats from '@/components/bookings/BookingStats';
import BookingTable from '@/components/bookings/BookingTable';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import BookingDetails from '@/components/bookings/BookingDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  court: {
    name: string;
    venue: {
      name: string;
    };
  };
}

interface BookingsResponse {
  bookings: Booking[];
  stats: {
    totalToday: number;
    pendingApprovals: number;
    revenue: number;
  };
}

export default function BookingPage() {
  const [data, setData] = useState<BookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/bookings');
      setData(response.data);
    } catch (error) {
      let message = 'Failed to fetch bookings';
      if (isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await axios.patch('/bookings', { bookingId: id, status });
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      setIsDetailsOpen(false);
      fetchBookings();
    } catch (error: unknown) {
      const message = isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : 'Something went wrong';
      toast.error(message);
    }
  };

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Booking Management</h2>
          <p className="text-muted-foreground">
            Monitor slots, approve requests, and manage your venue schedule.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchBookings} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {data && <BookingStats stats={data.stats} />}

      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="list" className="space-y-4">
          {data && <BookingTable bookings={data.bookings} onViewDetails={openDetails} />}
        </TabsContent>
        
        <TabsContent value="calendar">
          {data && <BookingCalendar bookings={data.bookings} />}
        </TabsContent>
      </Tabs>

      <BookingDetails 
        booking={selectedBooking} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        onStatusUpdate={handleUpdateStatus}
      />
    </div>
  );
}