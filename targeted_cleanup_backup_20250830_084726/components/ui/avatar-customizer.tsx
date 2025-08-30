import { useState } from 'react';
import { SaboAvatar } from '@/components/ui/sabo-avatar';
import { useRainbowAvatar } from '@/hooks/useRainbowAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Palette,
  Zap,
  Timer,
  RotateCcw,
  Upload,
  Sparkles,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AvatarCustomizerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showControls?: boolean;
  showUpload?: boolean;
  fallbackName?: string;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  className,
  size = 'xl',
  showControls = true,
  showUpload = true,
  fallbackName,
}) => {
  const { avatar, actions, fallbackUrl, isVerified } = useRainbowAvatar();
  const [activeTab, setActiveTab] = useState('preview');

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await actions.uploadAvatar(file);
    event.target.value = ''; // Reset input
  };

  const variantOptions = [
    // Basic Effects
    { value: 'default', label: 'Mặc định', icon: '🎯', category: 'basic' },
    { value: 'base', label: 'Rainbow Cơ bản', icon: '🌈', category: 'basic' },
    { value: 'neon', label: 'Neon', icon: '💡', category: 'basic' },
    { value: 'fire', label: 'Lửa', icon: '🔥', category: 'basic' },
    { value: 'water', label: 'Nước', icon: '💧', category: 'basic' },
    { value: 'earth', label: 'Đất', icon: '🌍', category: 'basic' },

    // Premium Effects
    {
      value: 'cosmic',
      label: 'Vũ trụ',
      icon: '🌌',
      category: 'premium',
      desc: 'Hiệu ứng thiên hà lung linh',
    },
    {
      value: 'matrix',
      label: 'Matrix',
      icon: '💚',
      category: 'premium',
      desc: 'Mã nguồn ma trận xanh',
    },
    {
      value: 'royal',
      label: 'Hoàng gia',
      icon: '👑',
      category: 'premium',
      desc: 'Vàng kim ánh sáng quý tộc',
    },
    {
      value: 'shadow',
      label: 'Bóng tối',
      icon: '🌑',
      category: 'premium',
      desc: 'Sức mạnh hắc ám',
    },
    {
      value: 'ice',
      label: 'Băng giá',
      icon: '❄️',
      category: 'premium',
      desc: 'Đông lạnh xanh crystal',
    },
    {
      value: 'lightning',
      label: 'Sét điện',
      icon: '⚡',
      category: 'premium',
      desc: 'Tia sét tím mạnh mẽ',
    },

    // Legacy Effects (for compatibility)
    {
      value: 'rainbow',
      label: 'Cầu vồng (Legacy)',
      icon: '🌈',
      category: 'basic',
    },
    {
      value: 'glow',
      label: 'Phát sáng (Legacy)',
      icon: '✨',
      category: 'basic',
    },
    {
      value: 'pulse',
      label: 'Nhấp nháy (Legacy)',
      icon: '💫',
      category: 'basic',
    },
    {
      value: 'shimmer',
      label: 'Lấp lánh (Legacy)',
      icon: '⚡',
      category: 'basic',
    },
    {
      value: 'platinum-elite',
      label: 'Platinum Elite',
      icon: '💎',
      category: 'premium',
      desc: 'Viền bạch kim sang trọng với hiệu ứng lấp lánh',
    },
    {
      value: 'diamond-silver',
      label: 'Diamond Silver',
      icon: '💠',
      category: 'premium',
      desc: 'Viền bạc với hiệu ứng facet kim cương',
    },
    {
      value: 'chrome-metal',
      label: 'Chrome Metal',
      icon: '🔗',
      category: 'premium',
      desc: 'Viền chrome kim loại với hiệu ứng phản chiếu',
    },
    {
      value: 'frost-silver',
      label: 'Frost Silver',
      icon: '❄️',
      category: 'premium',
      desc: 'Viền bạc với hiệu ứng sương giá tinh tế',
    },
    {
      value: 'white-gold',
      label: 'White Gold',
      icon: '🥇',
      category: 'premium',
      desc: 'Viền vàng trắng với điểm nhấn vàng nhẹ',
    },
    {
      value: 'silver-holographic',
      label: 'Silver Holographic',
      icon: '🔮',
      category: 'premium',
      desc: 'Viền bạc với hiệu ứng cầu vồng holographic',
    },
  ];

  const frameTypeOptions = [
    {
      value: 'premium-octagon',
      label: 'Premium Octagon',
      icon: '👑',
      category: 'luxury',
      desc: 'Khung bát giác cao cấp với viền vàng trắng (Mặc định)',
    },
    {
      value: 'octagon',
      label: 'SABO Octagon',
      icon: '🛡️',
      category: 'classic',
      desc: 'Khung bát giác truyền thống của SABO Arena',
    },
    {
      value: 'tech-edge',
      label: 'Tech Edge',
      icon: '⚡',
      category: 'futuristic',
      desc: 'Khung viền hiện đại với thiết kế cắt góc công nghệ cao',
    },
    {
      value: 'hexagon',
      label: 'Hexagon Warrior',
      icon: '🔷',
      category: 'geometric',
      desc: 'Khung lục giác với hiệu ứng gradient xoay',
    },
    {
      value: 'crystal',
      label: 'Crystal Diamond',
      icon: '💎',
      category: 'luxury',
      desc: 'Khung pha lê kim cương với hiệu ứng ánh sáng',
    },
    {
      value: 'blade',
      label: 'Blade Frame',
      icon: '⚔️',
      category: 'aggressive',
      desc: 'Khung góc cạnh với 10 cạnh sắc nhọn',
    },
    {
      value: 'neon-circuit',
      label: 'Neon Circuit',
      icon: '🔮',
      category: 'cyberpunk',
      desc: 'Khung mạch điện với hiệu ứng cyberpunk',
    },
    {
      value: 'plasma-ring',
      label: 'Plasma Ring',
      icon: '🌀',
      category: 'energy',
      desc: 'Khung tròn plasma với multiple energy rings',
    },
  ];

  const intensityOptions = [
    { value: 'subtle', label: 'Nhẹ nhàng', desc: 'Hiệu ứng tinh tế' },
    { value: 'normal', label: 'Bình thường', desc: 'Hiệu ứng cân bằng' },
    { value: 'intense', label: 'Mạnh mẽ', desc: 'Hiệu ứng nổi bật' },
  ];

  const speedOptions = [
    { value: 'slow', label: 'Chậm', desc: '12 giây/chu kỳ' },
    { value: 'normal', label: 'Bình thường', desc: '8 giây/chu kỳ' },
    { value: 'fast', label: 'Nhanh', desc: '4 giây/chu kỳ' },
  ];

  return (
    <div className={cn('avatar-customizer', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='preview' className='flex items-center gap-2'>
            <Camera className='w-4 h-4' />
            Xem trước
          </TabsTrigger>
          <TabsTrigger value='effects' className='flex items-center gap-2'>
            <Sparkles className='w-4 h-4' />
            Hiệu ứng
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Settings className='w-4 h-4' />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value='preview' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                Avatar của bạn
                {isVerified && (
                  <Badge variant='default' className='bg-primary-500'>
                    Đã xác thực
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center space-y-4'>
              {/* Avatar Preview */}
              <div className='relative'>
                <SaboAvatar
                  className='transition-all duration-300'
                  size={size}
                  showUpload={false}
                  fallbackName={fallbackName}
                />

                {avatar.isUploading && (
                  <div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent' />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {showUpload && (
                <div className='flex flex-col items-center gap-2'>
                  <Label htmlFor='avatar-upload' className='cursor-pointer'>
                    <Button
                      variant='outline'
                      className='flex items-center gap-2'
                      disabled={avatar.isUploading}
                    >
                      <Upload className='w-4 h-4' />
                      {avatar.isUploading ? 'Đang tải...' : 'Tải avatar mới'}
                    </Button>
                  </Label>
                  <Input
                    id='avatar-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleFileUpload}
                    className='hidden'
                  />
                  <p className='text-xs text-muted-foreground text-center'>
                    JPG, PNG, GIF tối đa 5MB
                  </p>
                </div>
              )}

              {/* Current Effect Info */}
              <div className='text-center'>
                <Badge variant='secondary' className='mb-2'>
                  {variantOptions.find(v => v.value === avatar.variant)?.label}
                </Badge>
                <p className='text-sm text-muted-foreground'>
                  Cường độ:{' '}
                  {
                    intensityOptions.find(i => i.value === avatar.intensity)
                      ?.label
                  }{' '}
                  • Tốc độ:{' '}
                  {speedOptions.find(s => s.value === avatar.speed)?.label}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value='effects' className='space-y-4'>
          {showControls && (
            <>
              {/* Frame Type Selection - Dropdown */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Settings className='w-5 h-5' />
                    Kiểu khung Avatar
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Select
                    value={avatar.frameType}
                    onValueChange={value =>
                      actions.updateAvatarFrameType(value as any)
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Chọn kiểu khung'>
                        <div className='flex items-center gap-2'>
                          <span>
                            {
                              frameTypeOptions.find(
                                f => f.value === avatar.frameType
                              )?.icon
                            }
                          </span>
                          <span>
                            {
                              frameTypeOptions.find(
                                f => f.value === avatar.frameType
                              )?.label
                            }
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {frameTypeOptions.map(frame => (
                        <SelectItem key={frame.value} value={frame.value}>
                          <div className='flex items-center gap-2 py-1'>
                            <span className='text-lg'>{frame.icon}</span>
                            <div>
                              <div className='font-medium'>{frame.label}</div>
                              <div className='text-xs text-muted-foreground'>
                                {frame.desc}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Current Frame Description */}
                  <div className='text-center p-3 bg-muted rounded-lg'>
                    <Badge variant='secondary' className='mb-2'>
                      {
                        frameTypeOptions.find(f => f.value === avatar.frameType)
                          ?.category
                      }
                    </Badge>
                    <p className='text-sm text-muted-foreground'>
                      {
                        frameTypeOptions.find(f => f.value === avatar.frameType)
                          ?.desc
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Variant Selection - Dropdown */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Palette className='w-5 h-5' />
                    Hiệu ứng Rainbow
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Select
                    value={avatar.variant}
                    onValueChange={value =>
                      actions.updateAvatarVariant(value as any)
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Chọn hiệu ứng'>
                        <div className='flex items-center gap-2'>
                          <span>
                            {
                              variantOptions.find(
                                v => v.value === avatar.variant
                              )?.icon
                            }
                          </span>
                          <span>
                            {
                              variantOptions.find(
                                v => v.value === avatar.variant
                              )?.label
                            }
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {/* Basic Effects Group */}
                      <div className='px-2 py-1.5 text-xs font-medium text-muted-foreground'>
                        🎯 Hiệu ứng cơ bản
                      </div>
                      {variantOptions
                        .filter(v => v.category === 'basic')
                        .map(variant => (
                          <SelectItem key={variant.value} value={variant.value}>
                            <div className='flex items-center gap-2 py-1'>
                              <span className='text-lg'>{variant.icon}</span>
                              <span className='font-medium'>
                                {variant.label}
                              </span>
                            </div>
                          </SelectItem>
                        ))}

                      {/* Premium Effects Group */}
                      <div className='px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-2 pt-2'>
                        💎 Hiệu ứng cao cấp
                      </div>
                      {variantOptions
                        .filter(v => v.category === 'premium')
                        .map(variant => (
                          <SelectItem key={variant.value} value={variant.value}>
                            <div className='flex items-center gap-2 py-1'>
                              <span className='text-lg'>{variant.icon}</span>
                              <div>
                                <div className='font-medium'>
                                  {variant.label}
                                </div>
                                {variant.desc && (
                                  <div className='text-xs text-muted-foreground'>
                                    {variant.desc}
                                  </div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* Current Variant Description */}
                  <div className='text-center p-3 bg-muted rounded-lg'>
                    <Badge
                      variant={
                        variantOptions.find(v => v.value === avatar.variant)
                          ?.category === 'premium'
                          ? 'default'
                          : 'secondary'
                      }
                      className='mb-2'
                    >
                      {variantOptions.find(v => v.value === avatar.variant)
                        ?.category === 'premium'
                        ? 'Premium'
                        : 'Basic'}
                    </Badge>
                    {variantOptions.find(v => v.value === avatar.variant)
                      ?.desc && (
                      <p className='text-sm text-muted-foreground'>
                        {
                          variantOptions.find(v => v.value === avatar.variant)
                            ?.desc
                        }
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Intensity Selection */}
              {avatar.variant !== 'default' && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Zap className='w-5 h-5' />
                      Cường độ hiệu ứng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={avatar.intensity}
                      onValueChange={value =>
                        actions.updateAvatarIntensity(value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {intensityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className='flex flex-col'>
                              <span className='font-medium'>
                                {option.label}
                              </span>
                              <span className='text-xs text-muted-foreground'>
                                {option.desc}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Speed Selection */}
              {avatar.variant !== 'default' && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Timer className='w-5 h-5' />
                      Tốc độ hiệu ứng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={avatar.speed}
                      onValueChange={value =>
                        actions.updateAvatarSpeed(value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {speedOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className='flex flex-col'>
                              <span className='font-medium'>
                                {option.label}
                              </span>
                              <span className='text-xs text-muted-foreground'>
                                {option.desc}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Quản lý Avatar</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Button
                variant='outline'
                onClick={actions.refreshAvatar}
                className='w-full'
                disabled={avatar.isLoading}
              >
                <RotateCcw
                  className={cn(
                    'w-4 h-4 mr-2',
                    avatar.isLoading && 'animate-spin'
                  )}
                />
                Làm mới
              </Button>

              <Button
                variant='destructive'
                onClick={actions.resetAvatar}
                className='w-full'
              >
                <RotateCcw className='w-4 h-4 mr-2' />
                Reset về mặc định
              </Button>

              {avatar.error && (
                <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
                  <p className='text-sm text-destructive'>{avatar.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
