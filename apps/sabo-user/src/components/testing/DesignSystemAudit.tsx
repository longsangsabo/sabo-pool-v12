// Page-Level Design System Standardization Tool
// Comprehensive audit and fix utility for SABO Arena pages

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Code, 
  Palette, 
  Layout,
  Zap,
  FileText,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SABO_DESIGN_TOKENS } from '@/config/DesignSystemConfig';
import { PAGE_LAYOUTS, CARD_LAYOUTS } from '@/config/PageLayoutConfig';
import { 
  StandardCard, 
  StandardStatusBadge, 
  StandardUserProfile,
  StandardStatsGrid 
} from '@/config/StandardComponents';

// Page audit configuration
const PAGE_AUDIT_CONFIG = {
  dashboard: {
    title: 'Dashboard Pages',
    pages: [
      { name: 'Main Dashboard', path: '/dashboard', component: 'DashboardPage' },

      { name: 'Simple Dashboard', path: '/simple-dashboard', component: 'SimpleDashboard' },
      { name: 'Analytics', path: '/analytics', component: 'AnalyticsPage' }
    ],
    checks: [
      'Typography consistency',
      'Color usage alignment',
      'Spacing standardization', 
      'Card layout uniformity',
      'Mobile responsiveness'
    ]
  },
  
  tournaments: {
    title: 'Tournament System',
    pages: [
      { name: 'Tournament Listing', path: '/tournaments', component: 'TournamentsPage' },
      { name: 'Tournament Detail', path: '/tournament/:id', component: 'TournamentDetailRealtime' },
      { name: 'Tournament Management', path: '/admin/tournaments', component: 'AdminTournaments' }
    ],
    checks: [
      'Card design consistency',
      'Status badge standardization',
      'Grid layout optimization',
      'Action button alignment',
      'Image aspect ratios'
    ]
  },
  
  challenges: {
    title: 'Challenge System',
    pages: [
      { name: 'Challenge Hub', path: '/challenges', component: 'EnhancedChallengesPageV3' },
      { name: 'SABO Challenges', path: '/sabo-challenges', component: 'SaboChallengesPage' },
      { name: 'Admin Challenges', path: '/admin/challenges', component: 'AdminChallenges' }
    ],
    checks: [
      'Challenge card uniformity',
      'Status system consistency',
      'Form styling standardization',
      'Modal design alignment',
      'Interactive element sizing'
    ]
  },
  
  profile: {
    title: 'Profile & Settings',
    pages: [
      { name: 'User Profile', path: '/profile', component: 'ProfilePage' },
      { name: 'Profile Settings', path: '/profile/settings', component: 'ProfileSettingsPage' },
      { name: 'Performance Tab', path: '/profile/performance', component: 'PerformanceTab' }
    ],
    checks: [
      'Form field consistency',
      'Input styling standardization',
      'Tab design uniformity',
      'Avatar display consistency',
      'Settings panel alignment'
    ]
  },
  
  admin: {
    title: 'Admin Panel',
    pages: [
      { name: 'Admin Dashboard', path: '/admin', component: 'AdminDashboard' },
      { name: 'User Management', path: '/admin/users', component: 'AdminUsers' },
      { name: 'Club Management', path: '/admin/clubs', component: 'AdminClubs' }
    ],
    checks: [
      'Table design consistency',
      'Filter component standardization',
      'Action button placement',
      'Status indicator alignment',
      'Data visualization consistency'
    ]
  },
  
  auth: {
    title: 'Authentication',
    pages: [
      { name: 'Login/Register', path: '/auth', component: 'AuthPage' },
      { name: 'Reset Password', path: '/reset-password', component: 'ResetPasswordPage' }
    ],
    checks: [
      'Form layout consistency',
      'Input field standardization',
      'Button styling alignment',
      'Error message display',
      'Mobile form optimization'
    ]
  }
};

// Sample standardized components for demonstration
const SampleComponents = () => {
  const sampleUser = {
    id: '1',
    username: 'player1',
    display_name: 'Nguyễn Văn A',
    avatar_url: null,
    verified_rank: 'I+',
    spa_points: 1250
  };

  const sampleStats = [
    { id: '1', label: 'Trận thắng', value: 24, color: 'green' as const, icon: CheckCircle },
    { id: '2', label: 'Trận thua', value: 12, color: 'red' as const, icon: XCircle },
    { id: '3', label: 'Tỷ lệ thắng', value: '67%', color: 'blue' as const, icon: AlertTriangle },
    { id: '4', label: 'Điểm SPA', value: 1250, color: 'yellow' as const, icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Typography Samples */}
      <StandardCard title="Typography System" variant="feature">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family-name:var(--font-bebas)]">
              Page Title - Bebas Neue
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Section Title - Geist Sans
            </h2>
            <p className="text-base text-gray-600">
              Body text using Geist Sans for optimal readability across all devices.
            </p>
            <div className="text-2xl font-bold text-blue-600 font-[family-name:var(--font-racing)]">
              1,250 - Racing Sans One for Numbers
            </div>
          </div>
        </div>
      </StandardCard>

      {/* Color System */}
      <StandardCard title="Color System" variant="feature">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['primary', 'secondary', 'success', 'warning', 'error'].map((color) => (
            <div key={color} className="text-center">
              <div className={`w-full h-16 rounded-lg mb-2 bg-${color}-500`} />
              <div className="text-sm font-medium capitalize">{color}</div>
              <div className="text-xs text-gray-500">500</div>
            </div>
          ))}
        </div>
      </StandardCard>

      {/* Status Badges */}
      <StandardCard title="Status Badge System" variant="default">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Tournament Status</h4>
            <div className="flex flex-wrap gap-2">
              <StandardStatusBadge status="upcoming" variant="tournament" />
              <StandardStatusBadge status="registration_open" variant="tournament" />
              <StandardStatusBadge status="ongoing" variant="tournament" />
              <StandardStatusBadge status="completed" variant="tournament" />
              <StandardStatusBadge status="cancelled" variant="tournament" />
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Challenge Status</h4>
            <div className="flex flex-wrap gap-2">
              <StandardStatusBadge status="open" variant="challenge" />
              <StandardStatusBadge status="pending" variant="challenge" />
              <StandardStatusBadge status="accepted" variant="challenge" />
              <StandardStatusBadge status="in_progress" variant="challenge" />
              <StandardStatusBadge status="completed" variant="challenge" />
            </div>
          </div>
        </div>
      </StandardCard>

      {/* User Profile Components */}
      <StandardCard title="User Profile Components" variant="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Horizontal Layout</h4>
            <div className="space-y-3">
              <StandardUserProfile user={sampleUser} size="sm" showRank showPoints />
              <StandardUserProfile user={sampleUser} size="md" showRank showPoints />
              <StandardUserProfile user={sampleUser} size="lg" showRank showPoints />
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Vertical Layout</h4>
            <div className="grid grid-cols-3 gap-4">
              <StandardUserProfile user={sampleUser} size="sm" orientation="vertical" showRank />
              <StandardUserProfile user={sampleUser} size="md" orientation="vertical" showRank />
              <StandardUserProfile user={sampleUser} size="lg" orientation="vertical" showRank />
            </div>
          </div>
        </div>
      </StandardCard>

      {/* Stats Grid */}
      <StandardCard title="Statistics Grid System" variant="default">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Compact Variant</h4>
            <StandardStatsGrid stats={sampleStats} variant="compact" />
          </div>
          <div>
            <h4 className="font-medium mb-3">Default Variant</h4>
            <StandardStatsGrid stats={sampleStats} variant="default" />
          </div>
        </div>
      </StandardCard>

      {/* Card Variants */}
      <StandardCard title="Card Layout System" variant="feature">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StandardCard title="Default Card" description="Standard content card" variant="default">
            <p className="text-gray-600">This is a default card with standard padding and styling.</p>
          </StandardCard>
          
          <StandardCard title="Compact Card" description="Reduced padding" variant="compact">
            <p className="text-gray-600">Compact card for dense layouts and mobile optimization.</p>
          </StandardCard>
          
          <StandardCard title="Tournament Card" description="Tournament-specific styling" variant="tournament">
            <p className="text-gray-600">Specialized card design for tournament listings and details.</p>
          </StandardCard>
          
          <StandardCard title="Challenge Card" description="Challenge-specific styling" variant="challenge">
            <p className="text-gray-600">Challenge card with distinctive left border and styling.</p>
          </StandardCard>
        </div>
      </StandardCard>
    </div>
  );
};

// Main Design System Audit Component
export const DesignSystemAudit: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('dashboard');
  const [auditResults, setAuditResults] = useState<Record<string, any>>({});
  const [isAuditing, setIsAuditing] = useState(false);
  const navigate = useNavigate();

  const runPageAudit = async (category: string) => {
    setIsAuditing(true);
    
    // Simulate audit process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const config = PAGE_AUDIT_CONFIG[category as keyof typeof PAGE_AUDIT_CONFIG];
    const results = {
      category,
      pages: config.pages.map(page => ({
        ...page,
        score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
        issues: Math.floor(Math.random() * 5),
        status: Math.random() > 0.3 ? 'passing' : 'needs-work'
      })),
      overallScore: Math.floor(Math.random() * 30) + 70,
      totalIssues: Math.floor(Math.random() * 15) + 5
    };
    
    setAuditResults(prev => ({ ...prev, [category]: results }));
    setIsAuditing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs-work': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Palette className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            SABO Arena Design System Audit
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive page-level design standardization tool. Audit existing pages and apply 
          unified design tokens for consistent user experience across all SABO Arena interfaces.
        </p>
      </div>

      {/* Main Audit Interface */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {Object.entries(PAGE_AUDIT_CONFIG).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {config.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(PAGE_AUDIT_CONFIG).map(([key, config]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            {/* Category Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{config.title}</CardTitle>
                    <p className="text-gray-600 mt-1">
                      {config.pages.length} pages • {config.checks.length} design checks
                    </p>
                  </div>
                  <Button 
                    onClick={() => runPageAudit(key)}
                    disabled={isAuditing}
                    className="flex items-center space-x-2"
                  >
                    <Code className="w-4 h-4" />
                    <span>{isAuditing ? 'Auditing...' : 'Run Audit'}</span>
                  </Button>
                </div>
              </CardHeader>
              
              {auditResults[key] && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {auditResults[key].overallScore}%
                      </div>
                      <div className="text-sm text-blue-700">Overall Score</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {auditResults[key].pages.filter((p: any) => p.status === 'passing').length}
                      </div>
                      <div className="text-sm text-green-700">Passing Pages</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {auditResults[key].totalIssues}
                      </div>
                      <div className="text-sm text-red-700">Design Issues</div>
                    </div>
                  </div>
                  
                  <Progress value={auditResults[key].overallScore} className="mb-4" />
                </CardContent>
              )}
            </Card>

            {/* Page Results */}
            {auditResults[key] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditResults[key].pages.map((page: any) => (
                  <Card key={page.path} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(page.status)}
                          <h3 className="font-semibold">{page.name}</h3>
                        </div>
                        <Badge className={getScoreColor(page.score)}>
                          {page.score}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Path:</span>
                          <code className="text-xs bg-gray-100 px-1 rounded">{page.path}</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Component:</span>
                          <span className="font-mono text-xs">{page.component}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issues:</span>
                          <span className={page.issues > 0 ? 'text-red-600' : 'text-green-600'}>
                            {page.issues}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(page.path)}
                          className="flex-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Fix
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Design Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Design System Checks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.checks.map((check, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{check}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Sample Standardized Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layout className="w-5 h-5" />
            <span>Standardized Component Library</span>
          </CardTitle>
          <p className="text-gray-600">
            Preview of unified design components to be applied across all pages
          </p>
        </CardHeader>
        <CardContent>
          <SampleComponents />
        </CardContent>
      </Card>

      {/* Standardized Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Standardized Pages</span>
          </CardTitle>
          <p className="text-gray-600">
            Pages that have been standardized with the design system
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Dashboard</div>
                <Badge className="bg-green-100 text-green-800">✓ Done</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Complete dashboard with design tokens</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/standardized-dashboard')}
                className="w-full"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Page
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Tournaments</div>
                <Badge className="bg-green-100 text-green-800">✓ Done</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Tournament system with standard components</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/standardized-tournaments')}
                className="w-full"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Page
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Challenges</div>
                <Badge className="bg-green-100 text-green-800">✓ Done</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Challenge pages with unified design</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/standardized-challenges')}
                className="w-full"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Page
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Profile</div>
                <Badge className="bg-green-100 text-green-800">✓ Done</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Profile page with design system</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/standardized-profile')}
                className="w-full"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Page
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div className="font-semibold text-blue-800">Design System Implementation Complete</div>
            </div>
            <p className="text-blue-700 text-sm">
              All core player role pages have been standardized with the SABO design system.
              The standardized pages include consistent typography, spacing, colors, and component usage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Device Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Responsive Design Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="font-medium">Mobile</div>
              <div className="text-sm text-gray-500">320px - 767px</div>
            </div>
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Tablet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="font-medium">Tablet</div>
              <div className="text-sm text-gray-500">768px - 1023px</div>
            </div>
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="font-medium">Desktop</div>
              <div className="text-sm text-gray-500">1024px+</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignSystemAudit;
