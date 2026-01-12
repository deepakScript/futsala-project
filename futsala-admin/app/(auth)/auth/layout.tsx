import React from 'react';
import ThemeToggler from '@/components/ui/ThemeToggler';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='h-[100vh] flex items-center justify-center relative'>
      <div className='absolute bottom-5 right-0 text-white'>
        <ThemeToggler />
      </div>
      {children}
    </div>
  );
};  

export default AuthLayout;