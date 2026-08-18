"use client"

import { useEffect, useState } from "react"
import { 
  DollarSign, 
  TrendingUp, 
  RefreshCcw, 
  CreditCard,
  History,
  Building2,
  Filter,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
  Settings
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import usePaymentStore from "@/store/usePaymentStore"
import { format } from "date-fns"

export default function PaymentsPage() {
  const { 
    transactions, 
    pagination,
    stats, 
    payouts, 
    isLoading, 
    fetchTransactions, 
    fetchStats, 
    fetchPayouts,
    processRefund
  } = usePaymentStore()

  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined)
  const [previousCursors, setPreviousCursors] = useState<(string | undefined)[]>([])
  
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [commissionRate, setCommissionRate] = useState("2")

  useEffect(() => {
    fetchStats()
    fetchTransactions({ limit: pageSize })
    fetchPayouts()
  }, [fetchStats, fetchTransactions, fetchPayouts, pageSize])

  const buildTransactionFilters = (cursor?: string) => ({
    status: statusFilter === 'all' ? undefined : statusFilter,
    method: methodFilter === 'all' ? undefined : methodFilter,
    cursor,
    limit: pageSize,
  })

  const handleNextPage = async () => {
    if (!pagination.nextCursor) return
    setPreviousCursors((prev) => [...prev, currentCursor])
    setCurrentCursor(pagination.nextCursor)
    await fetchTransactions(buildTransactionFilters(pagination.nextCursor))
  }

  const handlePreviousPage = async () => {
    if (previousCursors.length === 0) return
    const stack = [...previousCursors]
    const prevCursor = stack.pop()
    setPreviousCursors(stack)
    setCurrentCursor(prevCursor)
    await fetchTransactions(buildTransactionFilters(prevCursor))
  }

  const handleRefresh = () => {
    fetchStats()
    fetchTransactions(buildTransactionFilters(currentCursor))
    fetchPayouts()
  }

  const handleRefund = async (bookingId: string) => {
    if (confirm("Are you sure you want to process this refund? It will cancel the booking and mark the payment as refunded.")) {
      try {
        await processRefund(bookingId)
        alert("Refund processed successfully")
      } catch (error) {
        alert("Failed to process refund")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge className="bg-emerald-500 text-white border-none">Successful</Badge>
      case 'PENDING': return <Badge variant="outline" className="text-amber-500 border-amber-500/50">Processing</Badge>
      case 'FAILED': return <Badge variant="destructive">Failed</Badge>
      case 'REFUNDED': return <Badge className="bg-blue-500 text-white border-none">Refunded</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Management</h2>
          <p className="text-muted-foreground">
            Track platform revenue, venue payouts, and manage transaction records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsConfigDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Commission Settings
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-premium bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-primary-foreground/80">
            <CardTitle className="text-sm font-medium">Total Platform Volume</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nrs. {stats?.totalRevenue.toLocaleString() || '0'}</div>
            <p className="text-xs opacity-70 mt-1">
              Gross transaction value
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-premium bg-emerald-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-white/80">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nrs. {stats?.totalCommission.toLocaleString() || '0'}</div>
            <p className="text-xs opacity-70 mt-1">
              Currently @ {commissionRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-blue-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-white/80">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <RefreshCcw className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nrs. {stats?.totalRefunded.toLocaleString() || '0'}</div>
            <p className="text-xs opacity-70 mt-1">
              Processed through platform
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-amber-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-white/80">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nrs. {(payouts.reduce((sum, p) => sum + p.netPayout, 0)).toLocaleString()}</div>
            <p className="text-xs opacity-70 mt-1">
              Net venue earnings (All-time)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="transactions" className="gap-2"><History className="h-4 w-4" /> Transaction History</TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2"><Building2 className="h-4 w-4" /> Venue Payout Tracking</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-3 border-b border-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <CardDescription>A complete list of user payments and their status.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search txn or venue..." 
                      className="pl-9 w-[250px] h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PAID">Successful</SelectItem>
                      <SelectItem value="PENDING">Processing</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => handleRefresh()}>
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-muted/20">
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.filter(t => 
                    t.booking.court.venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.booking.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{tx.booking.user.fullName}</span>
                          <span className="text-[10px] text-muted-foreground">{tx.booking.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.booking.court.venue.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1 font-normal">
                          <CreditCard className="h-3 w-3" /> {tx.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">
                        Nrs. {tx.amount}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tx.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.status === 'PAID' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleRefund(tx.booking.id)}
                          >
                            <RefreshCcw className="h-4 w-4 mr-1" /> Refund
                          </Button>
                        ) : (
                          <Badge variant="outline" className="opacity-30">N/A</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : "No transactions found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Rows per page</span>
                  <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="h-8 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={isLoading || previousCursors.length === 0}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={isLoading || !pagination.hasNextPage}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card className="border-none shadow-premium">
            <CardHeader>
              <CardTitle>Venue Payout Tracking</CardTitle>
              <CardDescription>Track net earnings for each venue and their payout status.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-muted/20">
                    <TableHead>Venue & Owner</TableHead>
                    <TableHead>Gross Revenue</TableHead>
                    <TableHead>Platform Fee ({commissionRate}%)</TableHead>
                    <TableHead>Net Venue Payout</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p) => (
                    <TableRow key={p.venueId} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{p.venueName}</span>
                          <span className="text-xs text-muted-foreground">{p.ownerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">Nrs. {p.grossRevenue.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-rose-500">- Nrs. {p.commission.toLocaleString()}</TableCell>
                      <TableCell className="text-lg font-bold text-emerald-600">
                        Nrs. {p.netPayout.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="gap-2">
                          View Details <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {payouts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : "No payout data available."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Commission Config Dialog (Simulation) */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold">
              <Settings className="h-5 w-5 text-primary" />
              Platform Commission Settings
            </DialogTitle>
            <DialogDescription>
              Configure the percentage the platform takes from each booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Default Commission Rate (%)</Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number" 
                  value={commissionRate} 
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-[100px] text-lg font-bold"
                  max="100"
                  min="0"
                />
                <span className="text-2xl font-bold opacity-30">%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                Note: This value is currently used for local calculations in this session as DB schema changes are restricted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsConfigDialogOpen(false)}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
