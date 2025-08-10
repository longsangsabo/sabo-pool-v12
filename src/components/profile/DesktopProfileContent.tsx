import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditableProfileForm from '@/components/profile/EditableProfileForm';
import ClubManagementTab from '@/components/profile/ClubManagementTab';
import RankVerificationForm from '@/components/RankVerificationForm';
import { TabEditProfile } from '@/pages/mobile/profile/components/TabEditProfile';
import { User, Trophy, Building, Shield, Pencil } from 'lucide-react';

interface DesktopProfileContentProps {
  profile: any;
  theme: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  editingProfile: any;
  saving: boolean;
  onEditField: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

export const DesktopProfileContent: React.FC<DesktopProfileContentProps> = ({
  profile,
  theme,
  activeTab,
  onTabChange,
  editingProfile,
  saving,
  onEditField,
  onSave,
  onCancel,
  className = '',
}) => {
  const userRole = profile?.role || 'player';

  const tabs = [
    {
      value: 'edit',
      label: 'Chỉnh sửa',
      icon: Pencil,
      content: (
        <TabEditProfile
          editingProfile={editingProfile}
          saving={saving as any}
          onChange={onEditField as any}
          onSave={onSave}
          onCancel={onCancel}
          theme={theme}
        />
      ),
    },
    {
      value: 'basic',
      label: 'Thông tin',
      icon: User,
      content: <EditableProfileForm profile={profile} />,
    },
    {
      value: 'rank',
      label: 'Xác thực hạng',
      icon: Shield,
      content: <RankVerificationForm />,
    },
    {
      value: 'club',
      label: 'Quản lý CLB',
      icon: Building,
      content: <ClubManagementTab userRole={userRole} />,
    },
  ];

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={onTabChange} className='w-full'>
        <TabsList className={`grid w-full grid-cols-${tabs.length} bg-muted`}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground'
              >
                <Icon className='h-4 w-4' />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className='mt-6'>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DesktopProfileContent;
