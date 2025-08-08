import React from 'react';
import { Skeleton } from '@/components/ui/skeleton-loader';

export const DesktopProfileSkeleton: React.FC = () => {
  return (
    <div className='relative min-h-screen px-6 py-10 max-w-[1440px] mx-auto'>
      <div className='grid grid-cols-12 gap-8'>
        <div className='hidden xl:block col-span-3 space-y-6'>
          <Skeleton className='h-40 w-full rounded-xl' />
          <Skeleton className='h-[300px] w-full rounded-xl' />
        </div>
        <div className='col-span-12 xl:col-span-9 space-y-8'>
          <div className='flex flex-col md:flex-row gap-10'>
            <Skeleton className='h-[400px] w-[280px] rounded-xl' />
            <div className='flex-1 space-y-6'>
              <Skeleton className='h-32 w-full rounded-xl' />
              <Skeleton className='h-24 w-full rounded-xl' />
            </div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Skeleton className='h-60 w-full rounded-xl' />
            <Skeleton className='h-60 w-full rounded-xl lg:col-span-2' />
          </div>
          <Skeleton className='h-10 w-full rounded-md' />
          <Skeleton className='h-[500px] w-full rounded-xl' />
        </div>
      </div>
    </div>
  );
};

export default DesktopProfileSkeleton;
