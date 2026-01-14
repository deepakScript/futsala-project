"use client"

import { useEffect, useState } from "react"
import { 
  Users, 
  Search, 
  MoreHorizontal,  
  Key, 
  BarChart3, 
  Trash2,
  Phone,
  Mail,
  Building2,
  Loader2,
  TrendingUp,
  History,
  UserPlus,
  RefreshCcw
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import useOwnerStore from "@/store/useOwnerStore"
import { format } from "date-fns"

export default function VenueOwnersPage() {
  const { 
    owners, 
    isLoading, 
    fetchOwners, 
    createOwner,
    resetOwnerPassword, 
    deleteOwner,
    fetchOwnerPerformance,
    ownerPerformance
  } = useOwnerStore()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isPerfSheetOpen, setIsPerfSheetOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: ""
  })

  useEffect(() => {
    fetchOwners()
  }, [fetchOwners])

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createOwner(formData)
      setIsAddDialogOpen(false)
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "" })
    } catch (error) {
      alert("Failed to create venue owner")
    }
  }

  const filteredOwners = owners.filter(owner => {
    return owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleResetPassword = async () => {
    if (!selectedOwnerId || !newPassword) return
    try {
      await resetOwnerPassword(selectedOwnerId, newPassword)
      setIsResetDialogOpen(false)
      setNewPassword("")
      alert("Password reset successfully!")
    } catch (error) {
      alert("Failed to reset password.")
    }
  }

  const handleViewPerformance = async (id: string) => {
    setSelectedOwnerId(id)
    await fetchOwnerPerformance(id)
    setIsPerfSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Venue Owners</h2>
          <p className="text-muted-foreground">
            Manage partner accounts and track performance.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => fetchOwners()} disabled={isLoading}>
             <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
           <Button className="shadow-smooth" onClick={() => setIsAddDialogOpen(true)}>
             <UserPlus className="h-4 w-4 mr-2" /> Add Owner
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Owners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owners.length}</div>
            <p className="text-xs text-muted-foreground">
              Across the whole platform
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Manageable Venues</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {owners.reduce((sum, o) => sum + (o._count?.venues || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total venues owned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search owners by name or email..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-premium transition-all">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-muted/20">
                <TableHead>Owner Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Venues</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.map((owner) => (
                <TableRow key={owner.id} className="group transition-colors hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{owner.fullName}</span>
                      <span className="text-xs text-muted-foreground">Joined {format(new Date(owner.createdAt), 'MMM yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm flex items-center gap-1.5"><Mail className="h-3 w-3" /> {owner.email}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> {owner.phoneNumber || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="h-3 w-3" /> {owner._count?.venues}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-50">
                        <DropdownMenuLabel>Owner Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewPerformance(owner.id)} className="cursor-pointer gap-2">
                          <BarChart3 className="h-4 w-4" /> View Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedOwnerId(owner.id); setIsResetDialogOpen(true); }} className="cursor-pointer gap-2">
                          <Key className="h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => { if(confirm("Are you sure? This will permanently delete the owner account.")) deleteOwner(owner.id) }} 
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for this owner account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Sheet */}
      <Sheet open={isPerfSheetOpen} onOpenChange={setIsPerfSheetOpen}>
        <SheetContent className="sm:max-w-135 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Owner Performance</SheetTitle>
            <SheetDescription>
              Aggregated insights across all venues owned by this user.
            </SheetDescription>
          </SheetHeader>
          
          {ownerPerformance ? (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-emerald-50/50 border-emerald-100 shadow-none dark:bg-emerald-500/5 dark:border-emerald-500/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">+12%</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold">Rs. {ownerPerformance.totalRevenue}</div>
                      <p className="text-xs text-muted-foreground font-medium">Gross Revenue</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50/50 border-blue-100 shadow-none dark:bg-blue-500/5 dark:border-blue-500/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <History className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold">{ownerPerformance.totalBookings}</div>
                      <p className="text-xs text-muted-foreground font-medium">Total Bookings</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-muted/30 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Platform Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commission (10%)</span>
                    <span className="font-semibold text-rose-500">- Rs. {ownerPerformance.platformCommission}</span>
                  </div>
                  <div className="border-t border-dashed pt-3 flex justify-between">
                    <span className="font-medium">Net Payout</span>
                    <span className="font-bold text-lg text-emerald-600">Rs. {ownerPerformance.netOwnerEarnings}</span>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Venue Breakdown
                </h4>
                <div className="space-y-3">
                  {ownerPerformance.venueBreakdown.map(v => (
                    <div key={v.id} className="p-3 rounded-lg border border-muted/20 bg-muted/10 flex justify-between items-center transition-all hover:bg-muted/20">
                      <div>
                        <div className="font-medium text-sm">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.bookingsCount} bookings</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">Rs. {v.revenue}</div>
                        <div className="text-[10px] text-muted-foreground">Comm: Rs. {v.platformCommission}</div>
                      </div>
                    </div>
                  ))}
                  {ownerPerformance.venueBreakdown.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                      No active venues yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-100">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </SheetContent>
      </Sheet>
      {/* Add Owner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-112.5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-xl">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Venue Owner
            </DialogTitle>
            <DialogDescription>
              Create a new account for a venue partner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddOwner}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="owner@futsala.com" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  placeholder="+977-XXXXXXXXXX" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-semibold">Temporary Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Owner Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
