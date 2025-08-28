import { ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showSearch?: boolean;
  showProfile?: boolean;
  showMessages?: boolean;
  showBottomNav?: boolean;
  onMenuClick?: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showSearch = true,
  showProfile = true,
  showMessages = true,
  showBottomNav = true,
  onMenuClick,
}) => {
  return (
    <div className='min-h-screen bg-background lg:hidden'>
      {/* Mobile Header */}
      <MobileHeader
        title={title}
        showSearch={showSearch}
        showProfile={showProfile}
        showMessages={showMessages}
        onMenuClick={onMenuClick}
      />

      {/* Main Content */}
      <main className={`${showBottomNav ? 'pb-16' : ''}`}>{children}</main>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && <MobileNavigation />}
    </div>
  );
};
