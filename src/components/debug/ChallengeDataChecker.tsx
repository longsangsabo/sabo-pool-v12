import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Eye, Users, Clock, Trophy, Search } from 'lucide-react';

interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  status: string;
  bet_points: number;
  race_to: number;
  challenge_type: string | null;
  created_at: string;
  challenger_profile?: {
    full_name: string;
    display_name: string;
    avatar_url: string;
  };
  opponent_profile?: {
    full_name: string;
    display_name: string;
    avatar_url: string;
  };
}

export const ChallengeDataChecker: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          id,
          challenger_id,
          opponent_id,
          status,
          bet_points,
          race_to,
          challenge_type,
          created_at,
          challenger_profile:profiles!challenger_id(
            full_name,
            display_name,
            avatar_url
          ),
          opponent_profile:profiles!opponent_id(
            full_name,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setChallenges(data || []);
      
      // Calculate stats
      const totalCount = data?.length || 0;
      const statusBreakdown = data?.reduce((acc: any, challenge: Challenge) => {
        acc[challenge.status] = (acc[challenge.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const userInvolvement = data?.reduce((acc: any, challenge: Challenge) => {
        if (challenge.challenger_id === user?.id) acc.asChallenger++;
        if (challenge.opponent_id === user?.id) acc.asOpponent++;
        if (!challenge.opponent_id && challenge.status === 'pending') acc.openChallenges++;
        if (challenge.challenger_id === user?.id || challenge.opponent_id === user?.id) acc.myTotal++;
        return acc;
      }, { asChallenger: 0, asOpponent: 0, openChallenges: 0, myTotal: 0 }) || {};

      setStats({
        total: totalCount,
        statusBreakdown,
        userInvolvement,
        hasProfiles: data?.filter(c => c.challenger_profile).length || 0,
      });

    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted': return <Users className="w-4 h-4 text-blue-600" />;
      case 'completed': return <Trophy className="w-4 h-4 text-green-600" />;
      case 'declined': return <div className="w-4 h-4 rounded-full bg-red-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Challenge Data Checker
          </div>
          <Button 
            onClick={fetchChallenges} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-sm text-blue-600">Total Challenges</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.userInvolvement?.myTotal || 0}</div>
            <div className="text-sm text-green-600">My Challenges</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.userInvolvement?.openChallenges || 0}</div>
            <div className="text-sm text-yellow-600">Open Challenges</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.hasProfiles || 0}</div>
            <div className="text-sm text-purple-600">With Profiles</div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div>
          <h3 className="font-semibold mb-3">Status Breakdown:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => (
              <Badge key={status} className={getStatusColor(status)}>
                {getStatusIcon(status)}
                <span className="ml-1">{status}: {count as number}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* User Involvement */}
        <div>
          <h3 className="font-semibold mb-3">Your Involvement:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold">As Challenger: {stats.userInvolvement?.asChallenger || 0}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold">As Opponent: {stats.userInvolvement?.asOpponent || 0}</div>
            </div>
          </div>
        </div>

        {/* Recent Challenges List */}
        <div>
          <h3 className="font-semibold mb-3">Recent Challenges (Last 20):</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="border rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {challenge.id.slice(-8)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(challenge.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Challenger:</div>
                    <div className="text-gray-600">
                      {challenge.challenger_profile?.display_name || 
                       challenge.challenger_profile?.full_name || 
                       challenge.challenger_id.slice(-8)}
                    </div>
                    {challenge.challenger_id === user?.id && (
                      <Badge variant="outline" className="text-xs">YOU</Badge>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">Opponent:</div>
                    <div className="text-gray-600">
                      {challenge.opponent_id ? (
                        <>
                          {challenge.opponent_profile?.display_name || 
                           challenge.opponent_profile?.full_name || 
                           challenge.opponent_id.slice(-8)}
                          {challenge.opponent_id === user?.id && (
                            <Badge variant="outline" className="text-xs ml-1">YOU</Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-yellow-600 font-medium">OPEN</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>Bet: {challenge.bet_points} pts</span>
                  <span>Race to: {challenge.race_to}</span>
                  <span>Type: {challenge.challenge_type || 'standard'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading challenges...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeDataChecker;
