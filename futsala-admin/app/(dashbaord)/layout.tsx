'use client';

import Navbar from '@/components/ui/Navbar';
import Sidebar from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <aside className='hidden md:block w-[250px] border-r bg-secondary shrink-0'>
          <Sidebar />
        </aside>
        <main className='flex-1 overflow-y-auto p-5'>
          {children}
        </main>
      </div>
    </div>
  );
}
