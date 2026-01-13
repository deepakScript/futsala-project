'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SIDEBAR_GROUPS } from '@/constants/sidebar-menu'
import { Trophy, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/zustand/auth-store'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-background border-r w-64 shrink-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Trophy className="h-5 w-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">Futsala Admin</span>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-6">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.name} className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.name}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative',
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-primary' : 'group-hover:text-foreground'
                    )} />
                    <span className="text-sm">{item.name}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 mt-auto border-t space-y-4">
        {/* <button
          onClick={() => {
            const { logout } = useAuthStore.getState()
            logout().then(() => {
              window.location.href = '/'
            })
          }}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-all duration-200 text-destructive hover:bg-destructive/10 font-medium group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm">Logout</span>
        </button> */}
        
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs font-medium text-foreground mb-1">Super Admin Role</p>
          <div className="flex h-2 w-full bg-muted rounded-full overflow-hidden">
             <div className="h-full bg-primary w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
