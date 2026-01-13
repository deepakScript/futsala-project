"use client"

import { useEffect, useState } from "react"
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  Loader2,
  RefreshCcw,
  Key
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
import { Badge } from "@/components/ui/badge"
import useAdminStore from "@/store/useAdminStore"
import { format } from "date-fns"

export default function AdminsPage() {
  const { 
    admins, 
    isLoading, 
    fetchAdmins, 
    createAdmin, 
    deleteAdmin,
    updateAdmin
  } = useAdminStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: ""
  })

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAdmin(formData)
      setIsAddDialogOpen(false)
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "" })
    } catch (error) {
      alert("Failed to create admin")
    }
  }

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete admin "${name}"? This action cannot be undone.`)) {
      try {
        await deleteAdmin(id)
      } catch (error) {
        alert("Failed to delete admin")
      }
    }
  }

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password for this admin:")
    if (newPassword) {
      try {
        await updateAdmin(id, { password: newPassword })
        alert("Password updated successfully")
      } catch (error) {
        alert("Failed to update password")
      }
    }
  }

  const filteredAdmins = admins.filter(admin => 
    admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-muted-foreground">
            Manage system administrators and sub-admin accounts.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => fetchAdmins()} disabled={isLoading}>
             <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
           <Button className="shadow-smooth" onClick={() => setIsAddDialogOpen(true)}>
             <UserPlus className="h-4 w-4 mr-2" /> Add Admin
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-premium bg-muted/30">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search admins by name or email..." 
              className="pl-9 h-11 border-none shadow-sm bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-premium overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-muted/20">
                <TableHead>Admin Details</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {admin.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{admin.fullName}</span>
                        <span className="text-xs text-muted-foreground font-mono">{admin.id.split('-')[0]}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm flex items-center gap-1.5"><Mail className="h-3 w-3 text-muted-foreground" /> {admin.email}</span>
                      <span className="text-xs flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" /> {admin.phoneNumber || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5">
                      <ShieldCheck className="h-3 w-3" /> 
                      {admin.email.includes('superadmin') || admin.fullName.includes('Super') ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(admin.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2"
                          onClick={() => handleResetPassword(admin.id)}
                        >
                          <Key className="h-4 w-4 text-primary" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          onClick={() => handleDeleteAdmin(admin.id, admin.fullName)}
                          disabled={admin.email.includes('superadmin') || admin.fullName.includes('Super')}
                        >
                          <Trash2 className="h-4 w-4" /> Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAdmins.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No administrators found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {isLoading && (
            <div className="flex items-center justify-center p-12 bg-background/50 backdrop-blur-sm absolute inset-0 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Syncing administrators...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-xl">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Sub-Admin
            </DialogTitle>
            <DialogDescription>
              Assign administrative privileges to a new user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin}>
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
                  placeholder="admin@futsala.com" 
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <div className="flex gap-2">
                   <ShieldAlert className="h-4 w-4 text-blue-600 mt-0.5" />
                   <p className="text-[11px] text-blue-800 leading-normal">
                     <strong>Standard Permissions:</strong> New admins will have the system-wide `ADMIN` role. Specific permission toggles are currently disabled to maintain system integrity.
                   </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
