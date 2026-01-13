"use client"

import { useEffect, useState } from "react"
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  BarChart3, 
  Trash2,
  Phone,
  Mail,
  Building2,
  Loader2,
  TrendingUp,
  History
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useOwnerStore from "@/store/useOwnerStore"
import { format } from "date-fns"

export default function VenueOwnersPage() {
  const { 
    owners, 
    isLoading, 
    fetchOwners, 
    toggleOwnerVerification, 
    resetOwnerPassword, 
    deleteOwner,
    fetchOwnerPerformance,
    ownerPerformance
  } = useOwnerStore()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isPerfSheetOpen, setIsPerfSheetOpen] = useState(false)

  useEffect(() => {
    fetchOwners()
  }, [fetchOwners])

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === "all") return matchesSearch
    if (filterType === "verified") return matchesSearch && owner.isVerified
    if (filterType === "unverified") return matchesSearch && !owner.isVerified
    return matchesSearch
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
            Manage partner accounts, identity verification, and track performance.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Verified Partners</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owners.filter(o => o.isVerified).length}</div>
            <p className="text-xs text-muted-foreground">
              Identity confirmed
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
        <Tabs defaultValue="all" className="w-[400px]" onValueChange={setFilterType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="unverified">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-none shadow-premium transition-all">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-muted/20">
                <TableHead>Owner Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Identity</TableHead>
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
                    <Badge variant={owner.isVerified ? "default" : "outline"} className={owner.isVerified ? "bg-emerald-500/10 text-emerald-500 border-none" : ""}>
                      {owner.isVerified ? "Verified" : "Unverified"}
                    </Badge>
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
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Owner Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewPerformance(owner.id)} className="cursor-pointer gap-2">
                          <BarChart3 className="h-4 w-4" /> View Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleOwnerVerification(owner.id, owner.isVerified)} className="cursor-pointer gap-2">
                          {owner.isVerified ? <><ShieldAlert className="h-4 w-4" /> Unverify Identity</> : <><ShieldCheck className="h-4 w-4 text-emerald-500" /> Verify Identity</>}
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
        <DialogContent className="sm:max-w-[400px]">
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
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
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
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
