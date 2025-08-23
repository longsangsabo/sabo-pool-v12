import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Type, 
  Layout, 
  Smartphone, 
  Monitor, 
  CheckCircle,
  ArrowRight,
  Eye,
  Code,
  Sparkles
} from 'lucide-react';
import { SaboPlayerInterface } from '@/components/unified/SaboPlayerInterface';

/**
 * Demo page showcasing the synchronized desktop-mobile interface
 * This page demonstrates the visual consistency and design harmony
 * achieved through the synchronization process.
 */
export const DesktopMobileSyncDemo: React.FC = () => {
  const [showInterface, setShowInterface] = React.useState(false);

  const syncFeatures = [
    {
      icon: Palette,
      title: 'Color Synchronization',
      description: 'Mobile color palette extracted and applied to desktop',
      status: 'complete',
      details: '100% color consistency across platforms'
    },
    {
      icon: Type,
      title: 'Typography Harmony',
      description: 'Font families, sizes, and weights synchronized',
      status: 'complete',
      details: 'Inter font system with mobile-derived scale'
    },
    {
      icon: Layout,
      title: 'Component Alignment',
      description: 'Button styles, cards, and layouts harmonized',
      status: 'complete',
      details: 'Consistent spacing and visual rhythm'
    },
    {
      icon: Smartphone,
      title: 'Mobile Reference',
      description: 'Desktop interface follows mobile design language',
      status: 'complete',
      details: 'Navigation, badges, and interactions aligned'
    },
    {
      icon: Monitor,
      title: 'Desktop Enhancement',
      description: 'Enhanced desktop features with mobile consistency',
      status: 'complete',
      details: 'Expanded navigation while maintaining mobile feel'
    },
    {
      icon: Sparkles,
      title: 'Design System',
      description: 'Comprehensive token system for consistency',
      status: 'complete',
      details: '400+ synchronized design tokens'
    }
  ];

  if (showInterface) {
    return <SaboPlayerInterface />;
  }

  return (
    <>
      <Helmet>
        <title>SABO Arena - Desktop Mobile Sync Demo</title>
        <meta name="description" content="Desktop-Mobile Interface Synchronization Showcase" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                SABO Arena
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
              Desktop-Mobile Interface Synchronization
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive audit and standardization of desktop player interface, 
              synchronized with mobile design language for seamless user experience.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <Badge 
              variant="outline" 
              className="bg-green-100 text-green-700 border-green-200 px-6 py-2 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Synchronization Complete
            </Badge>
          </div>

          {/* Quick Preview */}
          <div className="text-center mb-12">
            <Button
              size="lg"
              onClick={() => setShowInterface(true)}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Eye className="w-5 h-5 mr-3" />
              View Synchronized Interface
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {syncFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-0 shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-700 text-xs"
                      >
                        ✓ Complete
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-3">
                      {feature.description}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {feature.details}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Implementation Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Design Tokens */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-primary" />
                  Design Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Color System</h4>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded border-2 border-white shadow-sm"></div>
                      <div className="w-6 h-6 bg-green-500 rounded border-2 border-white shadow-sm"></div>
                      <div className="w-6 h-6 bg-orange-500 rounded border-2 border-white shadow-sm"></div>
                      <div className="w-6 h-6 bg-red-500 rounded border-2 border-white shadow-sm"></div>
                      <div className="w-6 h-6 bg-purple-500 rounded border-2 border-white shadow-sm"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Typography Scale</h4>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">12px • 14px • 16px • 18px • 20px • 24px • 30px</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Spacing System</h4>
                    <div className="flex gap-1 items-end">
                      <div className="w-1 h-1 bg-gray-400"></div>
                      <div className="w-1 h-2 bg-gray-400"></div>
                      <div className="w-1 h-3 bg-gray-400"></div>
                      <div className="w-1 h-4 bg-gray-400"></div>
                      <div className="w-1 h-6 bg-gray-400"></div>
                      <div className="w-1 h-8 bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Key Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Seamless cross-device experience',
                    'Brand consistency maintained',
                    'Reduced development complexity',
                    'Enhanced user familiarity',
                    'Scalable design system',
                    'Future-proof architecture'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border">
              <h3 className="text-2xl font-bold mb-4">Ready to Explore?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Experience the synchronized desktop interface that maintains 100% visual 
                consistency with the mobile design while providing enhanced desktop functionality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowInterface(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl"
                >
                  <Monitor className="w-5 h-5 mr-2" />
                  View Desktop Interface
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open('/mobile-demo', '_blank')}
                  className="px-8 py-3 rounded-xl"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Compare Mobile Version
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
