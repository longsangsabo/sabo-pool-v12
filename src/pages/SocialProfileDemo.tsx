import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useSocialProfile } from '@/hooks/useSocialProfile';

const SocialProfileDemo: React.FC = () => {
  const navigate = useNavigate();
  const { navigateToSocialProfile } = useSocialProfile();

  // Mock user data for demo
  const mockUsers = [
    {
      id: 'user-1',
      name: 'Nguyễn Văn A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      role: 'player' as const,
    },
    {
      id: 'user-2', 
      name: 'SABO BILLIARDS',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=club1',
      role: 'club_owner' as const,
    },
    {
      id: 'user-3',
      name: 'Trần Thị B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      role: 'player' as const,
    },
    {
      id: 'user-4',
      name: 'ACE BILLIARDS CLUB',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=club2',
      role: 'club_owner' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎮 Demo Social Profile Card</CardTitle>
            <p className="text-muted-foreground">
              Click vào avatar bất kỳ để xem Social Profile Card
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockUsers.map((user) => (
            <Card 
              key={user.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigateToSocialProfile(user.id, user.name)}
            >
              <CardContent className="p-6 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-lg mb-2">{user.name}</h3>
                
                <div className="text-sm text-muted-foreground mb-4">
                  {user.role === 'club_owner' ? '🏢 Club Owner' : '🎯 Player'}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToSocialProfile(user.id, user.name);
                  }}
                >
                  Xem Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Hướng dẫn test:</h3>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Click vào avatar</strong> hoặc button "Xem Profile" để mở Social Profile Card</p>
              <p>2. <strong>Social Profile Card</strong> sẽ hiển thị với theme tối đẹp như trong ảnh</p>
              <p>3. <strong>Mobile responsive</strong> - tối ưu cho điện thoại</p>
              <p>4. <strong>Features:</strong> Avatar, Rank badge, Stats (ELO, SPA, XH, TRẬN), Action buttons</p>
            </div>
            
            <div className="mt-6 flex gap-4">
              <Button onClick={() => navigate('/')}>
                🏠 Về trang chủ
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/leaderboard')}
              >
                📊 Test Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialProfileDemo;
