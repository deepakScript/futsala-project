'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Calendar, Clock, CreditCard, User } from 'lucide-react';

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

interface BookingDetailsProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export default function BookingDetails({ booking, isOpen, onClose, onStatusUpdate }: BookingDetailsProps) {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Manage and review booking information for {booking.user.fullName}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/20">
            <User className="h-5 w-5 mt-0.5 text-primary" />
            <div className="grid gap-1">
              <h4 className="font-semibold text-sm">{booking.user.fullName}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {booking.user.phoneNumber}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" /> {booking.user.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Date</label>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(booking.bookingDate).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Time Slot</label>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {booking.startTime} - {booking.endTime}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Court</label>
              <div className="text-sm font-medium">{booking.court.name}</div>
              <div className="text-[10px] text-muted-foreground">{booking.court.venue.name}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Price</label>
              <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                <CreditCard className="h-4 w-4" />
                Rs. {booking.totalPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Payment Status</label>
              <div className="flex items-center gap-2">
                <Badge variant={booking.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                  {booking.paymentStatus}
                </Badge>
                {booking.otp && (
                  <Badge variant="outline" className="font-mono">
                    OTP: {booking.otp}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Booking Status</label>
              <div>
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
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Close
          </Button>
          {booking.status === 'PENDING' && (
            <>
              <Button 
                variant="destructive" 
                onClick={() => onStatusUpdate(booking.id, 'CANCELLED')}
                className="flex-1 sm:flex-none"
              >
                Cancel Booking
              </Button>
              <Button 
                onClick={() => onStatusUpdate(booking.id, 'CONFIRMED')}
                className="flex-1 sm:flex-none"
              >
                Approve Booking
              </Button>
            </>
          )}
          {booking.status === 'CONFIRMED' && (
             <Button 
              variant="destructive" 
              onClick={() => onStatusUpdate(booking.id, 'CANCELLED')}
              className="flex-1 sm:flex-none"
             >
               Cancel Booking
             </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
