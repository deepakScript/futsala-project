'use client';

import { useEffect, useState } from 'react';
import useCustomerStore from '@/lib/store/useCustomerStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Users, Search, RefreshCw, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerPage() {
  const { customers, pagination, isLoading, fetchCustomers } = useCustomerStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [previousCursors, setPreviousCursors] = useState<(string | undefined)[]>([]);

  useEffect(() => {
    setCurrentCursor(undefined);
    setPreviousCursors([]);
    fetchCustomers({ limit: pageSize, search: searchTerm || undefined });
  }, [fetchCustomers, pageSize, searchTerm]);

  const handleNextPage = async () => {
    if (!pagination.nextCursor) return;
    setPreviousCursors((prev) => [...prev, currentCursor]);
    setCurrentCursor(pagination.nextCursor);
    await fetchCustomers({
      cursor: pagination.nextCursor,
      limit: pageSize,
      search: searchTerm || undefined,
    });
  };

  const handlePreviousPage = async () => {
    if (previousCursors.length === 0) return;
    const stack = [...previousCursors];
    const prevCursor = stack.pop();
    setPreviousCursors(stack);
    setCurrentCursor(prevCursor);
    await fetchCustomers({
      cursor: prevCursor,
      limit: pageSize,
      search: searchTerm || undefined,
    });
  };

  const totalBookingsCount = customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
          <p className="text-muted-foreground">
            View customer details, booking history, and spending summaries.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCustomers({ cursor: currentCursor, limit: pageSize, search: searchTerm || undefined })}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Active venue bookers</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookingsCount}</div>
            <p className="text-xs text-muted-foreground">Lifetime customer bookings</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Customer Revenue</CardTitle>
            <span className="text-xs font-bold text-green-600">Nrs.</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nrs. {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Gross revenue from customers</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Last Booking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <span className="font-semibold text-foreground">{customer.fullName}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {customer.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {customer.phoneNumber || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.totalBookings} Bookings</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    Nrs. {customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {customer.lastBookingDate ? format(new Date(customer.lastBookingDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DataTablePagination
            pageSize={pageSize}
            setPageSize={setPageSize}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            isLoading={isLoading}
            hasPreviousPage={previousCursors.length > 0}
            hasNextPage={pagination.hasNextPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}