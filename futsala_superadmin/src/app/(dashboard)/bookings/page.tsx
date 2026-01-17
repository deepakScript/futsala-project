"use client"

import { useEffect, useState } from "react"
import { 
  CalendarCheck, 
  Search, 
  MoreHorizontal, 
  XCircle, 
  RefreshCcw, 
  AlertCircle, 
  Building2,
  Calendar,
  Filter,
  Loader2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import useBookingStore from "@/store/useBookingStore"
import useVenueStore from "@/store/useVenueStore"
import { format } from "date-fns"

export default function BookingsPage() {
  const { 
    bookings, 
    isLoading, 
    fetchBookings, 
    cancelBooking, 
    refundBooking, 
    updateBooking,
    deleteBooking
  } = useBookingStore()
  
  const { venues, fetchVenues } = useVenueStore()

  const [venueFilter, setVenueFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [bookingNote, setBookingNote] = useState("")

  useEffect(() => {
    fetchBookings()
    fetchVenues()
  }, [fetchBookings, fetchVenues])

  const handleApplyFilters = () => {
    fetchBookings({
      venueId: venueFilter === "all" ? undefined : venueFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      date: dateFilter || undefined
    })
  }

  const handleOpenNoteDialog = (id: string, currentNote: string | null) => {
    setSelectedBookingId(id)
    setBookingNote(currentNote || "")
    setIsNoteDialogOpen(true)
  }

  const handleSaveNote = async () => {
    if (!selectedBookingId) return
    try {
      await updateBooking(selectedBookingId, { notes: bookingNote })
      setIsNoteDialogOpen(false)
    } catch (error) {
      alert("Failed to save note")
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.court.venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.otp && booking.otp.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <Badge className="bg-emerald-500/10 text-emerald-500 border-none hover:bg-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed</Badge>
      case 'PENDING': return <Badge className="bg-amber-500/10 text-amber-500 border-none hover:bg-amber-500/20"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'CANCELLED': return <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-none hover:bg-rose-500/20"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
      case 'COMPLETED': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none hover:bg-blue-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge className="bg-emerald-500 text-white border-none">Paid</Badge>
      case 'PENDING': return <Badge variant="outline" className="text-amber-500 border-amber-500/50">Unpaid</Badge>
      case 'REFUNDED': return <Badge variant="outline" className="text-blue-500 border-blue-500/50">Refunded</Badge>
      case 'FAILED': return <Badge variant="destructive">Failed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Booking Management</h2>
          <p className="text-muted-foreground">
            Monitor, filter, and manage all court bookings across the platform.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => fetchBookings()} disabled={isLoading}>
             <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-premium bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Booking ID, Customer, Venue..." 
                  className="pl-9 h-10 border-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Venue</Label>
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger className="h-10 border-none shadow-sm bg-background">
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {venues.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 border-none shadow-sm bg-background">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="space-y-2 flex-1">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  className="h-10 border-none shadow-sm bg-background"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <Button className="h-10" onClick={handleApplyFilters}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-none shadow-premium transition-all overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-muted/20">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Venue & Court</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="group transition-colors hover:bg-muted/30">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    #{booking.id.split('-')[0].toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{booking.user.fullName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{booking.user.email}</span>
                        {booking.otp && (
                          <Badge variant="secondary" className="text-[10px] px-1 h-3.5 bg-muted/50 border-none">
                            OTP: {booking.otp}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-primary" /> {booking.court.venue.name}</span>
                      <span className="text-xs text-muted-foreground">{booking.court.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</span>
                      <span className="text-xs text-muted-foreground">{booking.startTime} - {booking.endTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold">Rs. {booking.totalPrice}</span>
                      {getPaymentBadge(booking.paymentStatus)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Booking Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2"
                          onClick={() => handleOpenNoteDialog(booking.id, booking.notes)}
                        >
                          <MessageSquare className="h-4 w-4 text-blue-500" /> Dispute / Notes
                        </DropdownMenuItem>
                        
                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                          <DropdownMenuItem 
                            className="cursor-pointer gap-2 text-rose-500 focus:text-rose-500"
                            onClick={() => { if(confirm("Cancel this booking?")) cancelBooking(booking.id) }}
                          >
                            <XCircle className="h-4 w-4 text-rose-500" /> Cancel Booking
                          </DropdownMenuItem>
                        )}

                        {booking.paymentStatus === 'PAID' && (
                          <DropdownMenuItem 
                            className="cursor-pointer gap-2 text-blue-500 focus:text-blue-500"
                            onClick={() => { if(confirm("Process refund and cancel booking?")) refundBooking(booking.id) }}
                          >
                            <RefreshCcw className="h-4 w-4 text-blue-500" /> Refund & Cancel
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          onClick={() => { if(confirm("Are you sure? This is permanent.")) deleteBooking(booking.id) }}
                        >
                          <Trash2 className="h-4 w-4" /> Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBookings.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No bookings found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {isLoading && (
            <div className="flex items-center justify-center p-8 bg-background/50 backdrop-blur-sm absolute inset-0 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute / Notes Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" /> 
              Booking Dispute & Notes
            </DialogTitle>
            <DialogDescription>
              Record any issues, disputes, or internal notes for this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Note Content</Label>
              <Textarea 
                id="notes" 
                placeholder="Describe the issue or resolution..." 
                className="min-h-[150px] border-muted"
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Trash2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}
