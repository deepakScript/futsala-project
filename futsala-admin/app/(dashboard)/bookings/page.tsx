'use client';

import { useEffect, useState } from 'react';
import axios, { isAxiosError } from '@/lib/axios';
import BookingStats from '@/components/bookings/BookingStats';
import BookingTable from '@/components/bookings/BookingTable';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import BookingDetails from '@/components/bookings/BookingDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  otp?: string;
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
  const [otpSearchTerm, setOtpSearchTerm] = useState('');

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

  const handleOtpSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSearchTerm.trim()) {
      toast.error('Please enter an OTP');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const booking = data?.bookings.find(b => 
      b.otp?.toLowerCase() === otpSearchTerm.toLowerCase() &&
      new Date(b.bookingDate).toISOString().split('T')[0] === today
    );

    if (booking) {
      openDetails(booking);
      setOtpSearchTerm('');
      toast.success('Booking found!');
    } else {
      toast.error('No booking found for today with this OTP');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = data?.bookings.filter(b => 
    new Date(b.bookingDate).toISOString().split('T')[0] === today
  ) || [];

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-1 space-y-4">
          <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Today&apos;s Bookings
              </h3>
              <Badge variant="secondary">{todayBookings.length} Slots</Badge>
            </div>
            
            <form onSubmit={handleOtpSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Enter OTP to verify..."
                className="pl-10 pr-20 bg-background/50 border-muted focus-visible:ring-primary h-11"
                value={otpSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpSearchTerm(e.target.value)}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1.5 top-1.5 h-8 px-3 rounded-lg"
              >
                Verify
              </Button>
            </form>

            <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {todayBookings.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">No bookings for today</p>
                </div>
              ) : (
                todayBookings.map((booking) => (
                  <div 
                    key={booking.id}
                    onClick={() => openDetails(booking)}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-accent/50 cursor-pointer transition-all group"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                        {booking.user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      {booking.otp && (
                        <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
                          {booking.otp}
                        </Badge>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1 capitalize">
                        {booking.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <Tabs defaultValue="list" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="list" className="rounded-md">List View</TabsTrigger>
                <TabsTrigger value="calendar" className="rounded-md">Calendar View</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="list" className="space-y-4 outline-none">
              {data && <BookingTable bookings={data.bookings} onViewDetails={openDetails} />}
            </TabsContent>
            
            <TabsContent value="calendar" className="outline-none">
              {data && <BookingCalendar bookings={data.bookings} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BookingDetails 
        booking={selectedBooking} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        onStatusUpdate={handleUpdateStatus}
      />
    </div>
  );
}