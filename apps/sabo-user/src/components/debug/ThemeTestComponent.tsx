/**
 * Theme Testing Component
 * Tests unified theme system functionality
 */

import React from 'react';
import { useTheme } from '@sabo/shared-ui/theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor, Smartphone } from 'lucide-react';

export const ThemeTestComponent: React.FC = () => {
  const { 
    theme, 
    resolvedTheme, 
    setTheme, 
    toggleTheme, 
    isDark, 
    isLight, 
    isSystem, 
    isMobile 
  } = useTheme();

  return (
    <Card className="max-w-md mx-auto m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Unified Theme System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Theme Status */}
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Current Theme:</strong> {theme}
          </div>
          <div className="text-sm">
            <strong>Resolved Theme:</strong> {resolvedTheme}
          </div>
          <div className="text-sm">
            <strong>Device Type:</strong> {isMobile ? 'Mobile' : 'Desktop'}
          </div>
          <div className="flex gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${isDark ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            {isSystem && (
              <span className="px-2 py-1 rounded bg-blue-200 text-blue-800">
                System
              </span>
            )}
          </div>
        </div>

        {/* Theme Controls */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Theme Controls:</div>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-1"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-1"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="flex items-center gap-1"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            className="w-full"
          >
            Toggle Theme
          </Button>
        </div>

        {/* Mobile Detection */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Mobile Detection:</div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">
              {isMobile ? 'Mobile device detected' : 'Desktop device detected'}
            </span>
          </div>
        </div>

        {/* Color Samples */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Theme Colors:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-background border">Background</div>
            <div className="p-2 rounded bg-foreground text-background border">Foreground</div>
            <div className="p-2 rounded bg-primary text-primary-foreground border">Primary</div>
            <div className="p-2 rounded bg-secondary text-secondary-foreground border">Secondary</div>
            <div className="p-2 rounded bg-muted text-muted-foreground border">Muted</div>
            <div className="p-2 rounded bg-accent text-accent-foreground border">Accent</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeTestComponent;
