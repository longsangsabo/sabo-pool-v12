import React from 'react';
import { getDisplayName } from '@/types/unified-profile';
import { useDisplayName } from '@/hooks/useDisplayName';
import { DisplayNameHealthCheck } from '@/components/admin/DisplayNameHealthCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Test component to verify display name functionality
export const DisplayNameTest = () => {
  // Test static function
  const testProfiles = [
    {
      user_id: 'test-1',
      display_name: 'Preferred Name',
      full_name: 'Full Name',
      email: 'test@example.com'
    },
    {
      user_id: 'test-2', 
      display_name: '',
      full_name: 'John Doe',
      email: 'john@example.com'
    },
    {
      user_id: 'test-3',
      email: 'player@example.com'
    },
    {
      user_id: 'test-user-12345'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Display Name Function Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testProfiles.map((profile, index) => (
              <div key={index} className="p-3 border rounded">
                <div className="font-medium">Test Case {index + 1}:</div>
                <div className="text-sm text-gray-600">
                  Input: {JSON.stringify(profile, null, 2)}
                </div>
                <div className="text-sm font-medium text-green-600">
                  Result: "{getDisplayName(profile)}"
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔧 Database Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <DisplayNameHealthCheck />
        </CardContent>
      </Card>
    </div>
  );
};

export default DisplayNameTest;
