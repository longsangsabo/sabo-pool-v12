import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Gift } from 'lucide-react';

interface SimpleClaim {
  id: number;
  user_email: string;
  user_name: string;
  user_phone: string;
  legacy_name: string;
  spa_points: number;
  status: string;
  admin_notes: string;
  created_at: string;
}

export const UltraSimpleClaimPanel: React.FC = () => {
  const [claims, setClaims] = useState<SimpleClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClaims = async () => {
    console.log('🔍 Loading simple claims...');
    try {
      const { data, error } = await supabase
        .from('simple_legacy_claims' as any)
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Claims response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        console.log('💡 Table might not exist. Click "Create Test" to create it.');
        setClaims([]);
      } else {
        setClaims((data as any) || []);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: number) => {
    try {
      const { error } = await supabase
        .from('simple_legacy_claims' as any)
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', claimId);

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('✅ Approved!');
        loadClaims();
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const handleReject = async (claimId: number) => {
    try {
      const { error } = await supabase
        .from('simple_legacy_claims' as any)
        .update({ status: 'rejected', processed_at: new Date().toISOString() })
        .eq('id', claimId);

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('❌ Rejected!');
        loadClaims();
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const createTestClaim = async () => {
    try {
      console.log('🔧 Creating test claim...');
      
      // Try to insert directly first
      const { data, error } = await supabase
        .from('simple_legacy_claims' as any)
        .insert({
          user_email: 'test@example.com',
          user_name: 'Test User ' + Date.now(),
          user_phone: '0123456789',
          legacy_name: 'TEST LEGACY ACCOUNT',
          spa_points: 50
        })
        .select();

      if (error) {
        console.error('❌ Insert error:', error);
        alert(`Table error: ${error.message}. Table might not exist yet.`);
      } else {
        console.log('✅ Insert success:', data);
        alert('✅ Test claim created!');
        loadClaims();
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      alert(`Error: ${err}`);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const processedClaims = claims.filter(c => c.status !== 'pending');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎯 Ultra Simple Legacy Claims</h1>
        <div className="space-x-2">
          <Button onClick={loadClaims} variant="outline">Refresh</Button>
          <Button onClick={createTestClaim} variant="secondary">Create Test</Button>
          <Button 
            onClick={() => window.open('https://supabase.com/dashboard/project/exlqvlbawytbglioqfbc/sql/new', '_blank')} 
            variant="outline"
            className="bg-green-50 border-green-300 text-green-700"
          >
            Open SQL Editor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{pendingClaims.length}</div>
            <div className="text-sm">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {processedClaims.filter(c => c.status === 'approved').length}
            </div>
            <div className="text-sm">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">
              {processedClaims.filter(c => c.status === 'rejected').length}
            </div>
            <div className="text-sm">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Claims */}
      {pendingClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-bold">{claim.user_name}</div>
                      <div className="text-sm text-gray-600">{claim.user_email}</div>
                      <div className="text-sm text-gray-600">{claim.user_phone}</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-600">{claim.spa_points} SPA Points</div>
                      <div className="text-sm text-gray-600">Legacy: {claim.legacy_name}</div>
                      <div className="text-xs text-gray-500">
                        Claim #{claim.id} • {new Date(claim.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleApprove(claim.id)} className="bg-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(claim.id)} variant="destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Claims */}
      {processedClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedClaims.map((claim) => (
                <div key={claim.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">{claim.user_name}</span>
                    <span className="ml-2 text-sm text-gray-600">({claim.spa_points} SPA)</span>
                  </div>
                  <Badge variant={claim.status === 'approved' ? 'default' : 'destructive'}>
                    {claim.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {claims.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No claims yet. Table might not exist.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <h3 className="font-bold text-yellow-800 mb-2">🔧 Setup Required:</h3>
              <ol className="text-sm text-yellow-700 space-y-2">
                <li>1. Click "Open SQL Editor" button above</li>
                <li>2. Copy and paste this SQL:</li>
                <pre className="bg-yellow-100 p-2 rounded text-xs mt-2 overflow-x-auto">
{`CREATE TABLE simple_legacy_claims (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  legacy_name TEXT NOT NULL,
  spa_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

GRANT ALL ON simple_legacy_claims TO anon;
GRANT ALL ON simple_legacy_claims TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE simple_legacy_claims_id_seq TO anon;

INSERT INTO simple_legacy_claims (user_email, user_name, user_phone, legacy_name, spa_points) VALUES
('test1@example.com', 'Nguyễn Văn A', '0123456789', 'LEGACY ACCOUNT A', 100),
('test2@example.com', 'Trần Thị B', '0987654321', 'LEGACY ACCOUNT B', 50);`}
                </pre>
                <li>3. Click "RUN" in SQL Editor</li>
                <li>4. Click "Refresh" here</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
