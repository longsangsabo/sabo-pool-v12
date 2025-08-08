import React, { useState } from 'react';
import { SaboAvatar } from '@/components/ui/sabo-avatar';
import { useRainbowAvatar } from '@/hooks/useRainbowAvatar';
import { Button } from '@/components/ui/button';

const TestAvatarPage = () => {
  const { avatar, actions } = useRainbowAvatar();

  const variants = [
    'default',
    'rainbow',
    'platinum-elite',
    'diamond-silver',
    'chrome-metal',
    'frost-silver',
    'white-gold',
    'silver-holographic',
    'tech-edge',
  ];

  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Test Avatar Variants</h1>

        <div className='mb-8'>
          <h2 className='text-xl font-semibold mb-4'>
            Current Variant: {avatar.variant}
          </h2>
          <div className='flex flex-wrap gap-2 mb-4'>
            {variants.map(variant => (
              <Button
                key={variant}
                variant={avatar.variant === variant ? 'default' : 'outline'}
                onClick={() => actions.updateAvatarVariant(variant as any)}
              >
                {variant}
              </Button>
            ))}
          </div>
        </div>

        <div className='text-center'>
          <h3 className='text-lg font-medium mb-4'>Live Preview</h3>
          <div className='w-48 h-48 mx-auto'>
            <SaboAvatar
              size='custom'
              className='w-full h-full'
              showUpload={false}
              fallbackName='Test'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAvatarPage;
