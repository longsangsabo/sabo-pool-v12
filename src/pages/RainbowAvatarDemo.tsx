import React, { useState } from 'react';
import { RainbowAvatar } from '@/components/ui/rainbow-avatar';
import { SaboAvatar } from '@/components/ui/sabo-avatar';
import { AvatarCustomizer } from '@/components/ui/avatar-customizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Star, 
  Sparkles, 
  Zap, 
  Timer,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RainbowAvatarDemo: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'rainbow' | 'glow' | 'pulse' | 'shimmer'>('rainbow');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'>('xl');

  const demoUser = {
    name: 'SABO Player',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  };

  const variants = [
    { 
      value: 'default', 
      label: 'Mặc định', 
      icon: <Eye className="w-4 h-4" />,
      description: 'Avatar chuẩn không hiệu ứng',
      color: 'bg-gray-500'
    },
    { 
      value: 'rainbow', 
      label: 'Cầu vồng', 
      icon: <Palette className="w-4 h-4" />,
      description: 'Viền cầu vồng chuyển động tinh tế',
      color: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500'
    },
    { 
      value: 'glow', 
      label: 'Phát sáng', 
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Hiệu ứng phát sáng dịu nhẹ',
      color: 'bg-blue-500'
    },
    { 
      value: 'pulse', 
      label: 'Nhấp nháy', 
      icon: <Zap className="w-4 h-4" />,
      description: 'Hiệu ứng nhấp nháy gradient',
      color: 'bg-purple-500'
    },
    { 
      value: 'shimmer', 
      label: 'Lấp lánh', 
      icon: <Timer className="w-4 h-4" />,
      description: 'Ánh sáng di chuyển qua avatar',
      color: 'bg-yellow-500'
    },
  ];

  const sizes = [
    { value: 'sm', label: 'Nhỏ', size: '32px' },
    { value: 'md', label: 'Trung bình', size: '48px' },
    { value: 'lg', label: 'Lớn', size: '64px' },
    { value: 'xl', label: 'Rất lớn', size: '96px' },
    { value: '2xl', label: 'Khổng lồ', size: '128px' },
    { value: '3xl', label: 'Siêu khổng lồ', size: '192px' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Rainbow Avatar Library
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thư viện giao diện avatar với hiệu ứng Cầu Vồng Tinh Tế dành riêng cho SABO ARENA
          </p>
          <Badge variant="secondary" className="text-sm">
            v1.0.0 - Sử dụng CSS Animation & React Hook
          </Badge>
        </div>

        {/* Demo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Xem trước Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Preview */}
              <div className="flex justify-center">
                <RainbowAvatar
                  src={demoUser.avatar}
                  fallback="SP"
                  size={selectedSize}
                  variant={selectedVariant}
                  intensity="normal"
                  speed="normal"
                  shape="octagon"
                />
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Kích thước:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size.value}
                      variant={selectedSize === size.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSize(size.value as any)}
                      className="h-auto p-2 flex flex-col gap-1"
                    >
                      <span className="text-xs font-medium">{size.label}</span>
                      <span className="text-xs text-muted-foreground">{size.size}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Variant Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Hiệu ứng:</h4>
                <div className="space-y-2">
                  {variants.map((variant) => (
                    <Button
                      key={variant.value}
                      variant={selectedVariant === variant.value ? 'default' : 'outline'}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedVariant(variant.value as any)}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full mr-3",
                        variant.color
                      )} />
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          {variant.icon}
                          <span className="font-medium">{variant.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variant.description}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Customizer */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar Customizer</CardTitle>
            </CardHeader>
            <CardContent>
              <AvatarCustomizer 
                size="lg"
                showControls={true}
                showUpload={true}
                fallbackName={demoUser.name}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Showcase Gallery */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Showcase Gallery</h2>
          
          {/* Variant Showcase */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {variants.map((variant) => (
              <Card key={variant.value} className="p-4 text-center">
                <div className="space-y-3">
                  <RainbowAvatar
                    src={demoUser.avatar}
                    fallback="SP"
                    size="lg"
                    variant={variant.value as any}
                    intensity="normal"
                    speed="normal"
                    shape="octagon"
                    className="mx-auto"
                  />
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {variant.icon}
                      <span className="font-medium text-sm">{variant.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {variant.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Size Showcase */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Kích thước Avatar</h2>
          <div className="flex items-end justify-center gap-4 flex-wrap">
            {sizes.map((size) => (
              <div key={size.value} className="text-center space-y-2">
                <RainbowAvatar
                  src={demoUser.avatar}
                  fallback="SP"
                  size={size.value as any}
                  variant="rainbow"
                  intensity="normal"
                  speed="normal"
                  shape="octagon"
                />
                <div className="text-xs">
                  <div className="font-medium">{size.label}</div>
                  <div className="text-muted-foreground">{size.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* SABO Octagon Showcase */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">SABO Octagon Style</h2>
          <div className="flex justify-center gap-8">
            <div className="text-center space-y-3">
              <SaboAvatar 
                size="3xl"
                showUpload={false}
                fallbackName="SABO Player"
              />
              <div>
                <h3 className="font-semibold">SABO Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  Với octagon clip-path và verified stamp
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <RainbowAvatar
                src={demoUser.avatar}
                fallback="RB"
                size="3xl"
                variant="rainbow"
                intensity="intense"
                speed="fast"
                shape="octagon"
                className="mx-auto"
              />
              <div>
                <h3 className="font-semibold">Rainbow Octagon</h3>
                <p className="text-sm text-muted-foreground">
                  Hiệu ứng cầu vồng với hình bát giác
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-muted-foreground">
          <p>🌈 Rainbow Avatar Library - Được phát triển cho SABO ARENA</p>
          <p>Sử dụng React, TypeScript, CSS Animations & Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default RainbowAvatarDemo;
