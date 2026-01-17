'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';

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

interface BookingTableProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
}

export default function BookingTable({ bookings, onViewDetails }: BookingTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.otp && booking.otp.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer or court..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.user.fullName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{booking.user.email}</span>
                        {booking.otp && (
                          <Badge variant="secondary" className="text-[10px] px-1 h-4">
                            OTP: {booking.otp}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">{booking.startTime} - {booking.endTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.court.name}</TableCell>
                  <TableCell>
                    <Badge variant={booking.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        booking.status === 'CONFIRMED' ? 'default' : 
                        booking.status === 'PENDING' ? 'outline' : 
                        'destructive'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(booking)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
