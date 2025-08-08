import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TestProps {
  tournament: any;
}

const TestTournamentCard: React.FC<TestProps> = ({ tournament }) => {
  return (
    <Card className='border-2 border-red-500 bg-red-50'>
      <CardContent className='p-4'>
        <h3 className='text-lg font-bold text-red-600'>TEST CARD</h3>
        <p>Tournament: {tournament?.name || 'No name'}</p>
        <p>This is a test card to verify rendering</p>
      </CardContent>
    </Card>
  );
};

export default TestTournamentCard;
