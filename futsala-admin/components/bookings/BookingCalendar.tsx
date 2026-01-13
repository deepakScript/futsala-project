'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    fullName: string;
  };
  court: {
    name: string;
  };
}

interface BookingCalendarProps {
  bookings: Booking[];
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDayBookings = bookings.filter((booking) => 
    date && isSameDay(new Date(booking.bookingDate), date)
  );

  // Generate modifiers for days with bookings
  const bookedDays = bookings.map(b => new Date(b.bookingDate));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              booked: bookedDays,
            }}
            modifiersStyles={{
              booked: { fontWeight: 'bold', textDecoration: 'underline' }
            }}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>
            Bookings for {date ? format(date, 'PPP') : 'Selected Date'}
          </CardTitle>
          <Badge variant="outline">{selectedDayBookings.length} Slots</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {selectedDayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No bookings scheduled for this day.
              </p>
            ) : (
              selectedDayBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/10 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{booking.startTime} - {booking.endTime}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.user.fullName} • {booking.court.name}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      booking.status === 'CONFIRMED' ? 'default' : 
                      booking.status === 'PENDING' ? 'outline' : 
                      'destructive'
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
