import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageLayout from '@/components/layout/PageLayout';
import LegacySPAGuide from '@/components/guide/LegacySPAGuide';

const GuidePage: React.FC = () => {
 return (
  <>
   <Navigation />
   <PageLayout variant='dashboard'>
    <div className='pt-20'>
     <LegacySPAGuide />
    </div>
   </PageLayout>
   <Footer />
  </>
 );
};

export default GuidePage;
