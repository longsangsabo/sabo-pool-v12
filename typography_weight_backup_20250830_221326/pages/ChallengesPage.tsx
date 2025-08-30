import React from 'react';
import EnhancedChallengesPageV3 from './challenges/EnhancedChallengesPageV3';

const ChallengesPage: React.FC = () => {
  try {
    return <EnhancedChallengesPageV3 />;
  } catch (error) {
    console.error('Error loading EnhancedChallengesPageV3:', error);
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center'>
          <h1 className='text-heading font-bold mb-4'>Thách đấu</h1>
          <p className='text-muted-foreground'>Đang tải trang thách đấu...</p>
        </div>
      </div>
    );
  }
};

export default ChallengesPage;
