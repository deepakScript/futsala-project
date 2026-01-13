
"use client"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_ITEMS } from '@/constants/menu-items';
import { cn } from '@/lib/utils';
import { LogOut, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import { useState } from 'react';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post('/auth/logout');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Command className='bg-secondary rounded-none h-full flex flex-col'>
      <CommandList className='max-h-none flex-1'>
        {MENU_ITEMS.map((group, index) => (
          <div key={group.heading}>
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <CommandItem key={item.title} className={cn(isActive && 'bg-accent')}>
                    <item.icon className='mr-2 h-4 w-4' />
                    <Link
                      href={item.href}
                      className={cn(isActive && 'font-bold opacity-100')}
                    >
                      {item.title}
                    </Link>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {index < MENU_ITEMS.length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
      
      <div className="mt-auto p-4 border-t border-muted-foreground/10">
        <CommandGroup heading="Account">
          <CommandItem 
            onSelect={handleLogout}
            className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </CommandItem>
        </CommandGroup>
      </div>
    </Command>
  );
};

export default Sidebar;
