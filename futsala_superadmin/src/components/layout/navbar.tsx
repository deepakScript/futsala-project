'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/zustand/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, User, Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Navbar() {
  const { logout, user } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Quick search..." 
            className="pl-9 h-9 bg-muted/50 focus-visible:ring-primary/20 border-none transition-all focus:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
        </Button>

        <div className="h-8 w-[1px] bg-border mx-1" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold leading-none">{user?.fullName || 'Super Admin'}</span>
            <span className="text-xs text-muted-foreground">{user?.role || 'Administrator'}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.fullName?.[0] || 'A'}
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="gap-2 ml-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
