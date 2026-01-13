'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const BackButton = () => {
  const router = useRouter();
  return (
    <Button variant='ghost' className='gap-2 pl-0 hover:bg-transparent' onClick={() => router.back()}>
      <ArrowLeft size={18} />
      Back
    </Button>
  );
};

export default BackButton;
