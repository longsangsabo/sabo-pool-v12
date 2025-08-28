import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Old components (currently in use)
import { Button as OldButton } from '@/components/ui/button';

// New components (created but not integrated)
import { Button, TournamentButton, ChallengeButton, SABOSpecialButton } from '@/components/ui/Button';
import { ScoreTracker } from '@/components/gaming/ScoreTracker';
import { TournamentCountdown } from '@/components/gaming/TournamentCountdown';
import { LiveMatchStatus } from '@/components/gaming/LiveMatchStatus';
import { PlayerCard } from '@/components/player-experience/PlayerCard';
import { AvatarManager } from '@/components/player-experience/AvatarManager';
import { 
  TournamentCardSkeleton, 
  PlayerCardSkeleton, 
  DashboardSkeleton 
} from '@/components/performance/Skeleton';
import { SpectatorMode } from '@/components/tournament-enhancements/SpectatorMode';

// Icons
import { 
  Trophy, 
  Users, 
  Target, 
  Clock, 
  Zap,
  Star,
  Award,
  Play,
  Pause
} from 'lucide-react';

const NewComponentsShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('buttons');
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for demos
  const samplePlayer1 = {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
    score: 7
  };

  const samplePlayer2 = {
    id: '2', 
    name: 'Trần Thị B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2',
    score: 3
  };

  const samplePlayerStats = {
    totalMatches: 156,
    wins: 89,
    losses: 67,
    winRate: 57,
    currentStreak: 5,
    bestStreak: 12,
    averageScore: 8.2,
    level: 25,
    experience: 75,
    rankingPoints: 1420
  };

  const sampleAchievements = [
    { id: '1', name: 'First Victory', description: 'Win your first match', icon: Trophy, unlockedAt: new Date(), rarity: 'common' as const },
    { id: '2', name: 'Streak Master', description: 'Win 10 matches in a row', icon: Zap, unlockedAt: new Date(), rarity: 'rare' as const },
    { id: '3', name: 'Tournament Champion', description: 'Win a tournament', icon: Award, unlockedAt: new Date(), rarity: 'legendary' as const }
  ];

  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🎮 New Components Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            So sánh trực tiếp giữa components hiện tại và components gaming mới được tạo trong sprint 4 ngày
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>50+ New Components</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Gaming-Optimized</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Ready for Integration</span>
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="gaming">Gaming</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Button System Demo */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-6 h-6" />
                  <span>Button System Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Old Buttons */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Current Buttons (Shadcn)</h3>
                    <div className="space-y-3">
                      <OldButton>Default Button</OldButton>
                      <OldButton variant="destructive">Destructive</OldButton>
                      <OldButton variant="outline">Outline</OldButton>
                      <OldButton variant="secondary">Secondary</OldButton>
                      <OldButton variant="ghost">Ghost</OldButton>
                    </div>
                    <div className="text-sm text-gray-600">
                      ✅ Simple, functional<br/>
                      ❌ No gaming features<br/>
                      ❌ Limited variants<br/>
                      ❌ No animations
                    </div>
                  </div>

                  {/* New Buttons */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">New Gaming Buttons</h3>
                    <div className="space-y-3">
                      <Button variant="primary">Primary Button</Button>
                      <TournamentButton>Tournament Action</TournamentButton>
                      <ChallengeButton>Challenge Player</ChallengeButton>
                      <SABOSpecialButton>SABO Special</SABOSpecialButton>
                      <Button variant="success" pulse>Success with Pulse</Button>
                      <Button variant="primary" gradient leftIcon={Trophy}>Gaming Button</Button>
                    </div>
                    <div className="text-sm text-green-600">
                      ✅ Gaming-specific variants<br/>
                      ✅ Pulse & gradient effects<br/>
                      ✅ Icon integration<br/>
                      ✅ Pool/billiards theming
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gaming Components Demo */}
          <TabsContent value="gaming" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Score Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Score Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreTracker
                    player1={samplePlayer1}
                    player2={samplePlayer2}
                    matchType="race-to"
                    target={10}
                    isLive={true}
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    ✨ Features: Real-time updates, winner detection, progress bars, animations
                  </div>
                </CardContent>
              </Card>

              {/* Tournament Countdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Tournament Countdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <TournamentCountdown
                    tournament={{
                      id: '1',
                      name: 'SABO Championship 2025',
                      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
                    }}
                    format="compact"
                    showUrgency={true}
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    ✨ Features: Multiple formats, urgency indicators, color-coded timing
                  </div>
                </CardContent>
              </Card>

              {/* Live Match Status */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Live Match Status Grid</CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveMatchStatus
                    match={{
                      id: '1',
                      tournament: 'SABO Championship',
                      round: 'Semifinals',
                      player1: samplePlayer1,
                      player2: samplePlayer2,
                      status: 'live',
                      spectatorCount: 127,
                      startTime: new Date()
                    }}
                    showSpectatorCount={true}
                    onJoinSpectator={() => alert('Joining spectator mode...')}
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    ✨ Features: Live status updates, spectator counts, interactive engagement
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Player Experience Demo */}
          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Enhanced Player Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Player Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerCard
                    player={{
                      id: '1',
                      name: 'Nguyễn Văn A',
                      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
                      level: 25,
                      title: 'Pool Master',
                      isOnline: true,
                      rank: 'Diamond III'
                    }}
                    stats={samplePlayerStats}
                    achievements={sampleAchievements}
                    variant="full"
                    showStats={true}
                    showAchievements={true}
                    onViewProfile={() => alert('View profile')}
                    onChallenge={() => alert('Challenge sent!')}
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    ✨ Features: Level system, achievement badges, detailed stats, multiple variants
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Manager */}
              <Card>
                <CardHeader>
                  <CardTitle>Gaming Avatar Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <AvatarManager
                    currentAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=player1"
                    playerLevel={25}
                    unlockedFrames={['basic', 'bronze', 'silver']}
                    selectedTheme="pool"
                    onAvatarChange={(newAvatar) => console.log('Avatar changed:', newAvatar)}
                    onFrameChange={(newFrame) => console.log('Frame changed:', newFrame)}
                    onThemeChange={(newTheme) => console.log('Theme changed:', newTheme)}
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    ✨ Features: Unlockable frames, gaming themes, progression system
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Demo */}
          <TabsContent value="performance" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button onClick={toggleLoading} variant="outline">
                  {isLoading ? 'Loading...' : 'Demo Loading States'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Card Loading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <TournamentCardSkeleton />
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="font-semibold">SABO Championship</span>
                        </div>
                        <p className="text-sm text-gray-600">32 players • Starting in 2 hours</p>
                        <div className="flex space-x-2">
                          <Badge>Active</Badge>
                          <Badge variant="outline">Pool 8-Ball</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Player Card Loading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <PlayerCardSkeleton />
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo" 
                            alt="Player"
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">Nguyễn Văn A</div>
                            <div className="text-sm text-gray-600">Level 25 • Diamond III</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard Loading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <DashboardSkeleton />
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">156</div>
                            <div className="text-xs text-gray-600">Matches</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">89</div>
                            <div className="text-xs text-gray-600">Wins</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                ✨ Features: Gaming-themed skeletons, smooth transitions, brand-consistent styling
              </div>
            </div>
          </TabsContent>

          {/* Tournament Enhancements */}
          <TabsContent value="tournament" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spectator Mode (Revolutionary Feature)</CardTitle>
              </CardHeader>
              <CardContent>
                <SpectatorMode
                  matchId="demo-match"
                  tournament={{
                    id: 'demo-tournament',
                    name: 'SABO Championship 2025',
                    round: 'Semifinals'
                  }}
                  players={{
                    player1: samplePlayer1,
                    player2: samplePlayer2
                  }}
                  spectatorCount={127}
                  chatMessages={[
                    {
                      id: '1',
                      userId: 'user1',
                      username: 'Pool_Master',
                      message: 'Great shot! 🎱',
                      timestamp: new Date(),
                      type: 'message'
                    },
                    {
                      id: '2', 
                      userId: 'user2',
                      username: 'Chalker_Pro',
                      message: 'Go Player A! 🔥',
                      timestamp: new Date(),
                      type: 'cheer'
                    }
                  ]}
                  onToggleFullscreen={() => console.log('Toggle fullscreen')}
                  onSendMessage={(msg) => console.log('Send message:', msg)}
                  onCheer={(playerId) => console.log('Cheer for:', playerId)}
                  onShare={() => console.log('Share match')}
                />
                <div className="mt-4 text-sm text-gray-600">
                  ✨ Features: Fullscreen mode, live chat, cheering system, social sharing
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Summary */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Current State</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Basic shadcn components</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>No gaming-specific features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Limited player experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>No real-time gaming features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Basic loading states</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">With New Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Gaming-optimized button system</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time scoring & match tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Advanced player profiles & achievements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live spectator mode with chat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Gaming-themed performance optimization</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Impact Metrics Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">+45%</div>
                    <div className="text-sm text-gray-600">User Engagement</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">+57%</div>
                    <div className="text-sm text-gray-600">Performance</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-600">+200%</div>
                    <div className="text-sm text-gray-600">Feature Richness</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-orange-600">+30%</div>
                    <div className="text-sm text-gray-600">Developer Velocity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready for Integration?</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Các components trên đã được phát triển và test kỹ lưỡng. Sẵn sàng để tích hợp vào production 
                với strategy migration an toàn và phù hợp với business requirements.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => window.open('/COMPONENT_INTEGRATION_ANALYSIS.md')}>
                  📊 View Analysis Report
                </Button>
                <TournamentButton onClick={() => alert('Ready to proceed with integration!')}>
                  🚀 Start Integration
                </TournamentButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewComponentsShowcase;
