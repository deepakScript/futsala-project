'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useBookingStore, { Booking } from '@/lib/store/useBookingStore';
import BookingStats from '@/components/bookings/BookingStats';
import BookingTable from '@/components/bookings/BookingTable';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import BookingDetails from '@/components/bookings/BookingDetails';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface OtpFormData {
  otp: string;
}

export default function BookingPage() {
  const { 
    bookings, 
    stats, 
    pagination, 
    isLoading, 
    fetchBookings, 
    updateBookingStatus 
  } = useBookingStore();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Pagination & Search state
  const [pageSize, setPageSize] = useState(10);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [previousCursors, setPreviousCursors] = useState<(string | undefined)[]>([]);

  // react-hook-form for OTP verification search
  const { register, handleSubmit, reset } = useForm<OtpFormData>();

  useEffect(() => {
    setCurrentCursor(undefined);
    setPreviousCursors([]);
    fetchBookings({ limit: pageSize });
  }, [fetchBookings, pageSize]);

  const handleNextPage = async () => {
    if (!pagination.nextCursor) return;
    setPreviousCursors((prev) => [...prev, currentCursor]);
    setCurrentCursor(pagination.nextCursor);
    await fetchBookings({
      cursor: pagination.nextCursor,
      limit: pageSize,
    });
  };

  const handlePreviousPage = async () => {
    if (previousCursors.length === 0) return;
    const stack = [...previousCursors];
    const prevCursor = stack.pop();
    setPreviousCursors(stack);
    setCurrentCursor(prevCursor);
    await fetchBookings({
      cursor: prevCursor,
      limit: pageSize,
    });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const onOtpSubmit = (data: OtpFormData) => {
    const otpSearchTerm = data.otp.trim();
    if (!otpSearchTerm) {
      toast.error('Please enter an OTP');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const booking = bookings.find((b) => 
      b.otp?.toLowerCase() === otpSearchTerm.toLowerCase() &&
      new Date(b.bookingDate).toISOString().split('T')[0] === todayStr
    );

    if (booking) {
      openDetails(booking);
      reset();
      toast.success('Booking found!');
    } else {
      toast.error('No booking found for today with this OTP');
    }
  };

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => 
    new Date(b.bookingDate).toISOString().split('T')[0] === todayStr
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Booking Management</h2>
          <p className="text-muted-foreground">
            Monitor slots, approve requests, and manage your venue schedule.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => fetchBookings({ cursor: currentCursor, limit: pageSize })} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {stats && <BookingStats stats={stats} />}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-1 space-y-4">
          <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Today&apos;s Bookings
              </h3>
              <Badge variant="secondary">{todayBookings.length}</Badge>
            </div>
            
            <form onSubmit={handleSubmit(onOtpSubmit)} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Verify OTP..."
                  className="pl-8 uppercase font-mono text-sm"
                  {...register('otp', { required: true })}
                />
              </div>
              <Button type="submit" size="sm">Verify</Button>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {todayBookings.map((b) => (
                <div 
                  key={b.id} 
                  onClick={() => openDetails(b)}
                  className="p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors space-y-2 text-sm bg-background"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{b.user.fullName}</span>
                    <Badge variant={b.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-[10px]">
                      {b.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{b.court.name}</span>
                    <span>{b.startTime} - {b.endTime}</span>
                  </div>
                </div>
              ))}
              {todayBookings.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No bookings scheduled for today.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="table" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="table" className="space-y-4">
              <BookingTable bookings={bookings} onViewDetails={openDetails} />
              <DataTablePagination
                pageSize={pageSize}
                setPageSize={setPageSize}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                isLoading={isLoading}
                hasPreviousPage={previousCursors.length > 0}
                hasNextPage={pagination.hasNextPage}
              />
            </TabsContent>

            <TabsContent value="calendar">
              <BookingCalendar bookings={bookings} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onStatusUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}