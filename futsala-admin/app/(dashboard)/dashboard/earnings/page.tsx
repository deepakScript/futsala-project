'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Download, 
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Summary {
  totalEarnings: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
}

interface Transaction {
  id: string;
  customer: string;
  venue: string;
  court: string;
  amount: number;
  method: string;
  date: string;
  status: string;
}

interface PendingPayment {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

export default function EarningsPage() {
  const [data, setData] = useState<{
    summary: Summary;
    transactions: Transaction[];
    pendingPayments: PendingPayment[];
    paymentMethods: { name: string; value: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEarnings = async () => {
    try {
      const response = await axios.get('/earnings');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const downloadReport = () => {
    if (!data) return;

    const headers = ['Transaction ID', 'Customer', 'Venue', 'Court', 'Amount', 'Method', 'Date', 'Status'];
    const rows = data.transactions.map(t => [
      t.id,
      t.customer,
      t.venue,
      t.court,
      t.amount,
      t.method,
      new Date(t.date).toLocaleDateString(),
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully');
  };

  const filteredTransactions = data?.transactions.filter(t => 
    t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Management</h2>
          <p className="text-muted-foreground">
            Track your revenue, manage transactions, and download financial reports.
          </p>
        </div>
        <Button onClick={downloadReport} className="gap-2">
          <Download className="h-4 w-4" />
          Download CSV Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {data.summary.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Overall lifetime earnings</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {data.summary.monthlyEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current calendar month</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {data.summary.weeklyEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Earnings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {data.summary.dailyEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Since midnight</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A list of all paid bookings and payments.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search customer or ID..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Customer</TableHead>
                     <TableHead>Court</TableHead>
                     <TableHead>Amount</TableHead>
                     <TableHead>Method</TableHead>
                     <TableHead>Date</TableHead>
                     <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="font-medium">{t.customer}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[100px]">{t.id}</div>
                        </TableCell>
                        <TableCell className="text-xs">{t.court}</TableCell>
                        <TableCell className="font-semibold text-green-600">Rs. {t.amount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {t.method.toLowerCase() === 'khalti' ? (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                <CreditCard className="h-3 w-3 mr-1" />
                                Khalti
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                <Banknote className="h-3 w-3 mr-1" />
                                Cash
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(t.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Pending Payments & Distribution */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.pendingPayments.length > 0 ? (
                data.pendingPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-orange-50/30 border-orange-100">
                    <div>
                      <div className="text-sm font-medium">{p.customer}</div>
                      <div className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">Rs. {p.amount}</div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200 h-5 px-1.5 text-[10px]">
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground italic">
                  No pending payments.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-none">
            <CardHeader>
              <CardTitle className="text-base italic">Payment Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.paymentMethods.map(m => (
                   <div key={m.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground uppercase tracking-wider">{m.name}</span>
                        <span className="font-bold">Rs. {m.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${m.name.toLowerCase() === 'khalti' ? 'bg-purple-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${(m.value / (data.summary.totalEarnings || 1)) * 100}%` }}
                        />
                      </div>
                   </div>
                ))}
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-4">
                  * Payment methods are automatically identified based on transaction records. 
                  Cash payments are usually settled manually.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
