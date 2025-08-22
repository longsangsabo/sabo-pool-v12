import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminViewMode } from '@/hooks/useAdminViewMode';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { 
  Eye, 
  Shield, 
  RefreshCw, 
  Smartphone, 
  ToggleLeft, 
  ToggleRight,
  CheckCircle,
  Users,
  Home,
  Settings,
  Trash2,
} from 'lucide-react';

export const AdminViewModeDemo: React.FC = () => {
  const { isAdmin } = useAdminCheck();
  const { viewMode, toggleViewMode, isPlayerView, isAdminView } = useAdminViewMode();

  if (!isAdmin) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-destructive' />
            Access Denied
          </CardTitle>
          <CardDescription>
            This demo is only available for admin users.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='space-y-6 max-w-2xl mx-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Smartphone className='h-5 w-5' />
            Admin Mobile Hybrid Interface Demo
          </CardTitle>
          <CardDescription>
            Switch between Admin and Player view modes on mobile
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Current Mode Display */}
          <div className='flex items-center justify-between p-4 bg-muted/50 rounded-lg'>
            <div className='flex items-center gap-3'>
              {isPlayerView ? (
                <Eye className='h-5 w-5 text-blue-500' />
              ) : (
                <Shield className='h-5 w-5 text-purple-500' />
              )}
              <div>
                <div className='font-medium'>
                  Current Mode: {isPlayerView ? 'Player View' : 'Admin View'}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {isPlayerView ? 'Experience app like a regular user' : 'Full admin interface'}
                </div>
              </div>
            </div>
            <Badge variant={isPlayerView ? 'default' : 'secondary'}>
              {isPlayerView ? 'Cleaning Mode' : 'Admin Mode'}
            </Badge>
          </div>

          {/* Toggle Button */}
          <div className='flex items-center justify-center'>
            <Button
              onClick={toggleViewMode}
              size='lg'
              variant={isPlayerView ? 'default' : 'outline'}
              className='gap-2'
            >
              {isPlayerView ? <ToggleRight className='h-4 w-4' /> : <ToggleLeft className='h-4 w-4' />}
              Switch to {isPlayerView ? 'Admin' : 'Player'} Mode
            </Button>
          </div>

          {/* Mode Features */}
          <div className='grid md:grid-cols-2 gap-4'>
            {/* Admin Mode Features */}
            <Card className={`${isAdminView ? 'ring-2 ring-purple-500' : 'opacity-60'}`}>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Shield className='h-4 w-4' />
                  Admin Mode
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Settings className='h-3 w-3' />
                  <span>Full admin interface</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Users className='h-3 w-3' />
                  <span>User management tools</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <CheckCircle className='h-3 w-3' />
                  <span>System analytics</span>
                </div>
              </CardContent>
            </Card>

            {/* Player Mode Features */}
            <Card className={`${isPlayerView ? 'ring-2 ring-blue-500' : 'opacity-60'}`}>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Eye className='h-4 w-4' />
                  Player View Mode
                  {isPlayerView && (
                    <Badge variant='secondary' className='text-xs'>
                      <RefreshCw className='h-2 w-2 mr-1' />
                      Clean
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Home className='h-3 w-3' />
                  <span>Player navigation tabs</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Trash2 className='h-3 w-3' />
                  <span>Content moderation tools</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Eye className='h-3 w-3' />
                  <span>User experience view</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className='p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
            <h4 className='font-medium text-blue-900 dark:text-blue-100 mb-2'>
              How to use on mobile:
            </h4>
            <ol className='text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside'>
              <li>Open the admin menu (☰ icon)</li>
              <li>Click "Chế Độ Player" to switch modes</li>
              <li>Experience the app like a regular user</li>
              <li>Use admin privileges to clean up content</li>
              <li>Toggle back to admin mode anytime</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
