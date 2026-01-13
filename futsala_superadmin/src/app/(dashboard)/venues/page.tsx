"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Ban, 
  CheckCircle, 
  Trash2,
  MapPin,
  Calendar,
  Users,
  Loader2
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
import { Textarea } from "@/components/ui/textarea"
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
  DialogTrigger,
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
import useVenueStore from "@/store/useVenueStore"
import { format } from "date-fns"

export default function VenuesPage() {
  const { venues, owners, isLoading, fetchVenues, fetchOwners, toggleVenueStatus, deleteVenue, createVenue } = useVenueStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newVenue, setNewVenue] = useState({
    name: "",
    address: "",
    city: "",
    phoneNumber: "",
    description: "",
    ownerId: ""
  })

  useEffect(() => {
    fetchVenues()
    fetchOwners()
  }, [fetchVenues, fetchOwners])

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createVenue(newVenue)
      setIsDialogOpen(false)
      setNewVenue({ name: "", address: "", city: "", phoneNumber: "", description: "", ownerId: "" })
    } catch (error) {
      console.error("Failed to create venue")
    }
  }

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          venue.owner?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === "all") return matchesSearch
    const isActive = filterStatus === "active"
    return matchesSearch && venue.isActive === isActive
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Venue Management</h2>
          <p className="text-muted-foreground">
            Manage all futsal venues on the platform.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add New Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateVenue}>
              <DialogHeader>
                <DialogTitle>Add New Venue</DialogTitle>
                <DialogDescription>
                  Enter the details for the new venue and assign it to an owner.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Venue Name</Label>
                  <Input 
                    id="name" 
                    value={newVenue.name} 
                    onChange={(e) => setNewVenue({...newVenue, name: e.target.value})} 
                    placeholder="E.g. Royal Futsal Arena" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={newVenue.city} 
                      onChange={(e) => setNewVenue({...newVenue, city: e.target.value})} 
                      placeholder="Kathmandu" 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={newVenue.phoneNumber} 
                      onChange={(e) => setNewVenue({...newVenue, phoneNumber: e.target.value})} 
                      placeholder="98XXXXXXXX" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input 
                    id="address" 
                    value={newVenue.address} 
                    onChange={(e) => setNewVenue({...newVenue, address: e.target.value})} 
                    placeholder="Near main road..." 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Assign Owner</Label>
                  <Select onValueChange={(val) => setNewVenue({...newVenue, ownerId: val})} value={newVenue.ownerId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map(owner => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.fullName} ({owner.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea 
                    id="desc" 
                    value={newVenue.description} 
                    onChange={(e) => setNewVenue({...newVenue, description: e.target.value})} 
                    placeholder="Short description..." 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Venue
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search venues or owners..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-[400px]" onValueChange={setFilterStatus}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-none shadow-premium transition-all">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-muted/20">
                <TableHead>Venue Details</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.map((venue) => (
                <TableRow key={venue.id} className="group transition-colors hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{venue.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {venue.city}, {venue.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{venue.owner?.fullName}</span>
                      <span className="text-xs text-muted-foreground">{venue.owner?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={venue.isActive ? "default" : "secondary"}>
                      {venue.isActive ? "Approved" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{venue._count?.bookings || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(venue.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/venues/${venue.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-orange-500"
                          onClick={() => toggleVenueStatus(venue.id, venue.isActive)}
                        >
                          {venue.isActive ? (
                            <><Ban className="h-4 w-4" /> Suspend Venue</>
                          ) : (
                            <><CheckCircle className="h-4 w-4" /> Approve Venue</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this venue? This action cannot be undone.")) {
                              deleteVenue(venue.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" /> Delete Venue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVenues.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No venues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
