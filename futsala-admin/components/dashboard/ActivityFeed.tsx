import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Booking {
  id: string;
  customer: string;
  court: string;
  date: string;
  time: string;
  amount: number;
  status: string;
}

export default function ActivityFeed({ bookings }: { bookings: Booking[] }) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent bookings found.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{booking.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{booking.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.court} • {booking.time}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-medium">Rs. {booking.amount.toLocaleString()}</p>
                  <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-[10px] h-4 mt-1">
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
