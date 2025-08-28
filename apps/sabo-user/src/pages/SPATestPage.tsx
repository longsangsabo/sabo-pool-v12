import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSPA } from '@/hooks/useSPA';
import { useAuth } from '@/hooks/useAuth';

const SPATestPage: React.FC = () => {
  const { user } = useAuth();
  const { currentPoints, loading, refreshSPAData } = useSPA();
  const [isAwarding, setIsAwarding] = useState(false);

  const handleTestGameWin = async () => {
    setIsAwarding(true);
    // Deprecated integration removed - functionality moved to core SPA system
    await refreshSPAData();
    setIsAwarding(false);
  };

  const handleTestGameLoss = async () => {
    setIsAwarding(true);
    // Deprecated integration removed - functionality moved to core SPA system
    await refreshSPAData();
    setIsAwarding(false);
  };

  const handleTestTournament = async () => {
    setIsAwarding(true);
    // Deprecated integration removed - functionality moved to core SPA system
    await refreshSPAData();
    setIsAwarding(false);
  };

  const handleTestRankRegistration = async () => {
    setIsAwarding(true);
    // Deprecated integration removed - functionality moved to core SPA system
    await refreshSPAData();
    setIsAwarding(false);
  };

  const handleTestBonus = async (activityType: string) => {
    setIsAwarding(true);
    // Deprecated integration removed - functionality moved to core SPA system
    console.log(`Test bonus: ${activityType}`);
    await refreshSPAData();
    setIsAwarding(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Vui lòng đăng nhập để test hệ thống SPA.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SPA Test Page</h1>
          <p className="text-gray-600">Test các tính năng của hệ thống SPA</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {loading ? 'Loading...' : `${currentPoints} SPA`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Game Actions</CardTitle>
            <CardDescription>Test milestone cho games</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleTestGameWin}
              disabled={isAwarding}
              className="w-full"
            >
              Simulate Game Win
            </Button>
            <Button 
              onClick={handleTestGameLoss}
              disabled={isAwarding}
              variant="outline"
              className="w-full"
            >
              Simulate Game Loss
            </Button>
          </CardContent>
        </Card>

        {/* Tournament Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Actions</CardTitle>
            <CardDescription>Test milestone cho tournaments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestTournament}
              disabled={isAwarding}
              className="w-full"
            >
              Join Tournament
            </Button>
          </CardContent>
        </Card>

        {/* Registration Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Actions</CardTitle>
            <CardDescription>Test bonus activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestRankRegistration}
              disabled={isAwarding}
              className="w-full"
            >
              Register Rank (+200 SPA)
            </Button>
          </CardContent>
        </Card>

        {/* Bonus Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Bonus Activities</CardTitle>
            <CardDescription>Test các bonus khác</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleTestBonus('profile_complete')}
              disabled={isAwarding}
              variant="outline"
              className="w-full"
            >
              Complete Profile (+75 SPA)
            </Button>
            <Button 
              onClick={() => handleTestBonus('first_deposit')}
              disabled={isAwarding}
              variant="outline"
              className="w-full"
            >
              First Deposit (+500 SPA)
            </Button>
            <Button 
              onClick={() => handleTestBonus('social_share')}
              disabled={isAwarding}
              variant="outline"
              className="w-full"
            >
              Social Share (+25 SPA)
            </Button>
          </CardContent>
        </Card>

        {/* New User Bonus */}
        <Card>
          <CardHeader>
            <CardTitle>New User Bonus</CardTitle>
            <CardDescription>Test new user welcome bonus</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleTestBonus('new_user')}
              disabled={isAwarding}
              className="w-full"
            >
              New User Bonus (+100 SPA)
            </Button>
          </CardContent>
        </Card>

        {/* Referral Test */}
        <Card>
          <CardHeader>
            <CardTitle>Referral System</CardTitle>
            <CardDescription>Test referral bonus</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleTestBonus('referral_success')}
              disabled={isAwarding}
              className="w-full"
            >
              Referral Success (+150 SPA)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• <strong>Game Actions:</strong> Sẽ trigger milestone cho số game đã chơi và thắng</p>
            <p>• <strong>Tournament:</strong> Sẽ trigger milestone cho tournament tham gia</p>
            <p>• <strong>Bonus Activities:</strong> Chỉ có thể claim một lần (trừ social share)</p>
            <p>• <strong>Auto Milestone:</strong> Hệ thống sẽ tự động check và trao thưởng milestone khi đạt mốc</p>
            <p>• Xem trang <strong>/spa</strong> để theo dõi tiến độ milestone chi tiết</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SPATestPage;
