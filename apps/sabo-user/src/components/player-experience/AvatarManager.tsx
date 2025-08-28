import React, { useState } from 'react';
import { clsx } from 'clsx';
import { 
  Upload, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Palette, 
  User,
  Shield,
  Crown,
  Star,
  Trophy
} from 'lucide-react';

interface AvatarTheme {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  preview: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockCondition?: string;
}

interface AvatarFrame {
  id: string;
  name: string;
  frameImage: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockCondition?: string;
}

interface AvatarManagerProps {
  currentAvatar?: string;
  currentTheme?: string;
  currentFrame?: string;
  themes: AvatarTheme[];
  frames: AvatarFrame[];
  playerName: string;
  playerLevel: number;
  onAvatarChange?: (avatar: string) => void;
  onThemeChange?: (themeId: string) => void;
  onFrameChange?: (frameId: string) => void;
  onUpload?: (file: File) => void;
  className?: string;
}

export const AvatarManager: React.FC<AvatarManagerProps> = ({
  currentAvatar,
  currentTheme = 'default',
  currentFrame,
  themes = [],
  frames = [],
  playerName,
  playerLevel,
  onAvatarChange,
  onThemeChange,
  onFrameChange,
  onUpload,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'themes' | 'frames'>('avatar');
  const [isEditing, setIsEditing] = useState(false);

  const selectedTheme = themes.find(t => t.id === currentTheme) || themes[0];
  const selectedFrame = frames.find(f => f.id === currentFrame);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const tabs = [
    { id: 'avatar', label: 'Avatar', icon: User },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'frames', label: 'Frames', icon: Shield }
  ];

  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 shadow-lg', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Avatar Manager</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              isEditing 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            )}
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Avatar Preview */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Frame */}
            {selectedFrame && (
              <div className="absolute inset-0 pointer-events-none">
                <img 
                  src={selectedFrame.frameImage} 
                  alt={selectedFrame.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Avatar */}
            <div className={clsx(
              'relative w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg',
              selectedTheme?.borderColor || 'border-gray-300'
            )}>
              {currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={clsx(
                  'w-full h-full flex items-center justify-center text-2xl font-bold',
                  selectedTheme?.backgroundColor || 'bg-gray-200',
                  selectedTheme?.textColor || 'text-gray-700'
                )}>
                  {playerName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
              {playerLevel}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Avatar Tab */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={!isEditing}
                />
                <label
                  htmlFor="avatar-upload"
                  className={clsx(
                    'inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer',
                    isEditing
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload New Avatar</span>
                </label>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>Recommended: Square image, 400x400px minimum</p>
                <p>Supported formats: JPG, PNG, GIF (max 5MB)</p>
              </div>
            </div>
          )}

          {/* Themes Tab */}
          {activeTab === 'themes' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => isEditing && theme.unlocked && onThemeChange?.(theme.id)}
                  disabled={!theme.unlocked || !isEditing}
                  className={clsx(
                    'relative p-4 rounded-lg border-2 transition-all',
                    theme.unlocked 
                      ? getRarityColor(theme.rarity)
                      : 'border-gray-200 bg-gray-100 opacity-50',
                    currentTheme === theme.id && 'ring-2 ring-blue-500',
                    isEditing && theme.unlocked && 'hover:scale-105'
                  )}
                >
                  <div className={clsx(
                    'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold',
                    theme.backgroundColor,
                    theme.textColor
                  )}>
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900">
                    {theme.name}
                  </div>
                  
                  {!theme.unlocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Shield className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs">
                          {theme.unlockCondition}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {theme.rarity !== 'common' && (
                    <div className="absolute top-1 right-1">
                      {theme.rarity === 'legendary' && <Crown className="w-4 h-4 text-yellow-500" />}
                      {theme.rarity === 'epic' && <Star className="w-4 h-4 text-purple-500" />}
                      {theme.rarity === 'rare' && <Trophy className="w-4 h-4 text-blue-500" />}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Frames Tab */}
          {activeTab === 'frames' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => isEditing && frame.unlocked && onFrameChange?.(frame.id)}
                  disabled={!frame.unlocked || !isEditing}
                  className={clsx(
                    'relative p-4 rounded-lg border-2 transition-all',
                    frame.unlocked 
                      ? getRarityColor(frame.rarity)
                      : 'border-gray-200 bg-gray-100 opacity-50',
                    currentFrame === frame.id && 'ring-2 ring-blue-500',
                    isEditing && frame.unlocked && 'hover:scale-105'
                  )}
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <img 
                      src={frame.frameImage} 
                      alt={frame.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900">
                    {frame.name}
                  </div>
                  
                  {!frame.unlocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Shield className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs">
                          {frame.unlockCondition}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {frame.rarity !== 'common' && (
                    <div className="absolute top-1 right-1">
                      {frame.rarity === 'legendary' && <Crown className="w-4 h-4 text-yellow-500" />}
                      {frame.rarity === 'epic' && <Star className="w-4 h-4 text-purple-500" />}
                      {frame.rarity === 'rare' && <Trophy className="w-4 h-4 text-blue-500" />}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
