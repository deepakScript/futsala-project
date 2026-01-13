"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Star,
  Shield,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useVenueStore from "@/store/useVenueStore"
import { format } from "date-fns"

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { 
    selectedVenue, 
    venueStats, 
    isLoading, 
    fetchVenueDetails, 
    fetchVenueStats,
    toggleVenueStatus 
  } = useVenueStore()

  useEffect(() => {
    fetchVenueDetails(id)
    fetchVenueStats(id)
  }, [id, fetchVenueDetails, fetchVenueStats])

  if (isLoading && !selectedVenue) {
    return <div className="flex h-[400px] items-center justify-center">Loading...</div>
  }

  if (!selectedVenue) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{selectedVenue.name}</h2>
            <Badge variant={selectedVenue.isActive ? "default" : "secondary"}>
              {selectedVenue.isActive ? "Approved" : "Suspended"}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {selectedVenue.address}, {selectedVenue.city}
          </p>
        </div>
        <div className="flex gap-2">
           <Button 
            variant="outline"
            className={selectedVenue.isActive ? "text-orange-500 border-orange-200 hover:bg-orange-50" : "text-green-500 border-green-200 hover:bg-green-50"}
            onClick={() => toggleVenueStatus(selectedVenue.id, selectedVenue.isActive)}
           >
             {selectedVenue.isActive ? "Suspend Venue" : "Approve Venue"}
           </Button>
           <Button variant="destructive">Delete Venue</Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Owner Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{selectedVenue.owner?.fullName}</p>
                    <p className="text-sm flex items-center gap-2"><Mail className="h-3 w-3" /> {selectedVenue.owner?.email}</p>
                    <p className="text-sm flex items-center gap-2"><Phone className="h-3 w-3" /> {selectedVenue.owner?.phoneNumber}</p>
                  </div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" /> Ratings & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-bold text-2xl">{selectedVenue.rating.toFixed(1)} / 5.0</p>
                    <p className="text-sm text-muted-foreground">Based on {selectedVenue.totalReviews} reviews</p>
                  </div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-bold text-2xl">{selectedVenue.courts?.length || 0} Courts</p>
                    <p className="text-sm text-muted-foreground">Available for bookings</p>
                  </div>
                </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About this venue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedVenue.description || "No description provided for this venue."}
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {selectedVenue.amenities.map(amenity => (
                  <Badge key={amenity} variant="outline" className="text-xs">{amenity}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>Comprehensive list of all bookings for this venue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venueStats?.bookings.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.user.fullName}</span>
                          <span className="text-xs text-muted-foreground">{booking.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{booking.court.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                           {booking.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {booking.totalPrice.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!venueStats?.bookings || venueStats.bookings.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No bookings found for this venue.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="pt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {venueStats?.summary.totalRevenue.toLocaleString()}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Commission (10%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">Rs. {venueStats?.summary.commission.toLocaleString()}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Net Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">Rs. {venueStats?.summary.netOwnerEarnings.toLocaleString()}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Revenue Rate</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex items-center gap-2">
                     <TrendingUp className="h-5 w-5 text-green-500" />
                     <span className="font-bold">90% Margin</span>
                   </div>
                </CardContent>
             </Card>
          </div>

          <Card>
             <CardHeader>
               <CardTitle>Earnings Breakdown</CardTitle>
               <CardDescription>Detailed look at how platform commission is calculated for this venue.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h4 className="font-semibold">Standard Platform Fee</h4>
                        <p className="text-sm text-muted-foreground">Fixed commission of 10% on every successful booking.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">10%</span>
                      </div>
                   </div>
                   
                   <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gross Transactions</span>
                        <span>Rs. {venueStats?.summary.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-500">
                        <span>Platform Cut (-10%)</span>
                        <span>- Rs. {venueStats?.summary.commission.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                        <span>Payable to Owner</span>
                        <span className="text-green-600">Rs. {venueStats?.summary.netOwnerEarnings.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
