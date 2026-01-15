"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggler from '@/components/ui/ThemeToggler';

import axios from '@/lib/axios';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const Navbar = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearStore = useAuthStore((state) => state.logout);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      clearStore();
      router.push('/auth');
      router.refresh();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Get initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  if (!mounted) {
    return (
      <div className='bg-primary dark:bg-slate-700 text-white py-2 px-5 flex justify-between'>
        <Link href='/'>
          {/* <Image src='/logo.png' alt='TraversyPress' width={40} height={40} /> */}
        </Link>
        <div className='flex items-center gap-4'>
          <ThemeToggler />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-primary dark:bg-slate-700 text-white py-2 px-5 flex justify-between'>
      <Link href='/'>
        {/* <Image src='/logo.png' alt='TraversyPress' width={40} height={40} /> */}
      </Link>

      <div className='flex items-center gap-4'>
        {user && <span className='hidden sm:inline text-sm font-medium'>Hi, {user.name}</span>}
        <ThemeToggler />
        <DropdownMenu>
          <DropdownMenuTrigger className='focus:outline-none'>
            <Avatar>
              <AvatarImage src='' alt={user?.name} />
              <AvatarFallback className='text-black'>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href='/profile'>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;