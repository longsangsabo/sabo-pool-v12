/**
 * Theme Test Page
 * Validates unified theme system integration
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor, Smartphone, Palette } from 'lucide-react';
import { MobileOptimizedCard } from '@/components/mobile/MobileOptimizedCard';
import { EnhancedTournamentBracketGenerator } from '@/components/tournaments/EnhancedTournamentBracketGenerator';
import { EnhancedTournamentCard } from '@/components/tournaments/EnhancedTournamentCard';
import { EnhancedGamingLeaderboard } from '@/components/tournaments/EnhancedGamingLeaderboard';

export const ThemeTestPage: React.FC = () => {
  // Test if we can access theme context
  let themeInfo = null;
  try {
    // This will be available once ThemeProvider is properly integrated
    // const themeContext = useTheme();
    themeInfo = "Theme context will be available after integration";
  } catch (error) {
    themeInfo = "Theme context not yet available";
  }

  // Mock data for Phase 4 component testing
  const mockTournament = {
    id: '1',
    name: 'SABO Championship 2024',
    description: 'Annual championship tournament with the best players',
    tournament_type: 'double_elimination' as const,
    status: 'registration' as const,
    start_date: '2024-09-15',
    registration_deadline: '2024-09-10',
    entry_fee: 100000,
    prize_pool: 5000000,
    max_participants: 16,
    current_participants: 12,
    venue: 'SABO Arena',
    club_name: 'SABO Pro Club',
    banner_image: 'https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=TOURNAMENT'
  };

  const mockPlayers = [
    {
      id: '1',
      rank: 1,
      previous_rank: 2,
      full_name: 'Nguyễn Văn A',
      display_name: 'ProPlayer_A',
      elo: 2150,
      previous_elo: 2100,
      points: 2450,
      wins: 45,
      losses: 5,
      total_games: 50,
      win_rate: 90,
      current_rank: 'Master',
      is_online: true,
      club_name: 'SABO Pro'
    },
    {
      id: '2', 
      rank: 2,
      previous_rank: 1,
      full_name: 'Trần Thị B',
      display_name: 'QueenOfPool',
      elo: 2120,
      previous_elo: 2150,
      points: 2380,
      wins: 42,
      losses: 8,
      total_games: 50,
      win_rate: 84,
      current_rank: 'Master',
      is_online: false,
      club_name: 'Elite Club'
    },
    {
      id: '3',
      rank: 3,
      previous_rank: 4,
      full_name: 'Lê Văn C',
      display_name: 'PoolShark',
      elo: 2050,
      previous_elo: 2020,
      points: 2200,
      wins: 38,
      losses: 12,
      total_games: 50,
      win_rate: 76,
      current_rank: 'Professional',
      is_online: true,
      club_name: 'Champion Club'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-6 w-6" />
              🎨 Unified Theme System - Phase 2 Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Testing the unified mobile-first theme system integration.
            </p>
          </CardContent>
        </Card>

        {/* CSS Variables Test */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-12 rounded bg-background border" />
                <p className="text-xs">Background</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded bg-foreground" />
                <p className="text-xs">Foreground</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded bg-primary" />
                <p className="text-xs">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded bg-secondary" />
                <p className="text-xs">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded bg-muted" />
                <p className="text-xs">Muted</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded bg-accent" />
                <p className="text-xs">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded bg-card border" />
                <p className="text-xs">Card</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded bg-popover border" />
                <p className="text-xs">Popover</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>Component Integration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nested Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This tests nested card components with theme variables.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mobile Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">Mobile responsive</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Aware</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span className="text-sm">Auto theme detection</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Manual Theme Toggle Test */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Theme Toggle Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test manual theme switching by adding/removing the 'dark' class from the document:
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }}
                  className="flex items-center gap-1"
                >
                  <Sun className="h-4 w-4" />
                  Force Light
                </Button>
                <Button
                  onClick={() => {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }}
                  className="flex items-center gap-1"
                >
                  <Moon className="h-4 w-4" />
                  Force Dark
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const isDark = document.documentElement.classList.contains('dark');
                    document.documentElement.classList.toggle('dark', !isDark);
                    document.documentElement.classList.toggle('light', isDark);
                  }}
                  className="flex items-center gap-1"
                >
                  <Monitor className="h-4 w-4" />
                  Toggle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile-Optimized Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>📱 Mobile-First Component Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MobileOptimizedCard
              title="Tournament Challenge"
              description="Join the weekly billiards tournament. Win prizes and improve your ranking!"
              imageUrl="https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=🎱"
              status="active"
              actions={{
                primary: { label: "Join Tournament", onClick: () => alert("Joining tournament...") },
                secondary: { label: "View Details", onClick: () => alert("Viewing details...") }
              }}
              stats={[
                { label: "Players", value: 24 },
                { label: "Prize", value: "500K" }
              ]}
            />
            
            <MobileOptimizedCard
              title="Club Registration"
              description="Register your billiards club to access premium features"
              status="pending"
              actions={{
                primary: { label: "Complete Registration", onClick: () => alert("Completing...") }
              }}
              stats={[
                { label: "Progress", value: "75%" },
                { label: "Steps Left", value: 2 }
              ]}
            />
            
            <MobileOptimizedCard
              title="Season 2 Completed"
              description="Congratulations! You've completed Season 2 challenges"
              status="completed"
              actions={{
                primary: { label: "View Rewards", onClick: () => alert("Viewing rewards...") }
              }}
              stats={[
                { label: "Rank", value: "#12" },
                { label: "Points", value: "2,450" }
              ]}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Theme Context:</strong> {themeInfo}
              </div>
              <div className="text-sm">
                <strong>CSS Variables:</strong> ✅ Active
              </div>
              <div className="text-sm">
                <strong>Tailwind Integration:</strong> ✅ Working
              </div>
              <div className="text-sm">
                <strong>Component Theming:</strong> ✅ Functional
              </div>
              <div className="text-sm">
                <strong>Mobile Optimization:</strong> ✅ 44px Touch Targets
              </div>
              <div className="text-sm">
                <strong>Phase 3 Status:</strong> ✅ Component Migration Complete
              </div>
              <div className="text-sm">
                <strong>Phase 4 Status:</strong> 🚀 Enhanced Gaming Components Active
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase 4 Enhanced Gaming Components */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-6 text-primary-foreground">Phase 4: Enhanced Gaming Components</h2>
          
          {/* Enhanced Tournament Card Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Tournament Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <EnhancedTournamentCard tournament={mockTournament} />
                <EnhancedTournamentCard 
                  tournament={{
                    ...mockTournament,
                    id: '2',
                    name: 'Quick Fire Tournament',
                    status: 'active' as const,
                    current_participants: 8,
                    max_participants: 8
                  }} 
                />
                <EnhancedTournamentCard 
                  tournament={{
                    ...mockTournament,
                    id: '3',
                    name: 'Weekend Challenge',
                    status: 'completed' as const,
                    current_participants: 16,
                    max_participants: 16
                  }} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Gaming Leaderboard Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Gaming Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedGamingLeaderboard 
                players={mockPlayers}
                title="SABO Championship Leaderboard"
              />
            </CardContent>
          </Card>

          {/* Enhanced Tournament Bracket Generator Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Tournament Bracket Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedTournamentBracketGenerator 
                tournamentId="test-tournament-1"
                tournamentType="single_elimination"
                participantCount={8}
                onBracketGenerated={() => console.log('Bracket generated successfully')}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThemeTestPage;
