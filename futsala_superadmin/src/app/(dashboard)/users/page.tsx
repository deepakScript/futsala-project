'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Loader2, Eye, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  totalBookings: number;
}

interface Booking {
  id: string;
  venueName: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: User) => {
    try {
      await axiosInstance.patch(`/users/${user.id}/status`, {
        isVerified: !user.isVerified,
      });
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, isVerified: !u.isVerified } : u
      ));

      toast.success(`User ${!user.isVerified ? 'activated' : 'blocked'} successfully.`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status.');
    }
  };

  const handleViewHistory = async (user: User) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
    setLoadingBookings(true);
    try {
      const response = await axiosInstance.get(`/users/${user.id}/bookings`);
      setUserBookings(response.data);
    } catch (error) {
      console.error('Error fetching booking history:', error);
      toast.error('Failed to fetch booking history.');
    } finally {
      setLoadingBookings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <div className="text-muted-foreground">
          Total Users: {users.length}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-center">Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
               <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-center">{user.totalBookings}</TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? 'default' : 'destructive'}>
                      {user.isVerified ? 'Active' : 'Blocked'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewHistory(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                          {user.isVerified ? (
                            <>
                              <Ban className="mr-2 h-4 w-4 text-destructive" />
                              <span className="text-destructive">Block User</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              <span className="text-green-600">Activate User</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Booking History</SheetTitle>
            <SheetDescription>
              History for {selectedUser?.fullName} ({selectedUser?.email})
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {loadingBookings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : userBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found for this user.
              </div>
            ) : (
              userBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{booking.venueName}</h4>
                      <p className="text-sm text-muted-foreground">{booking.courtName}</p>
                    </div>
                    <Badge variant={
                      booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'default' : 
                      booking.status === 'CANCELLED' ? 'destructive' : 'secondary'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>{' '}
                      {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>{' '}
                      {booking.startTime} - {booking.endTime}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>{' '}
                      Nrs. {booking.totalPrice}
                    </div>
                     <div>
                      <span className="text-muted-foreground">Payment:</span>{' '}
                       <span className={booking.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                        {booking.paymentStatus}
                       </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}