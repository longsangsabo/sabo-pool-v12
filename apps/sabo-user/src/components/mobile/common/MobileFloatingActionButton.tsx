import { useState } from 'react';
import { Plus, Swords, Trophy, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FABAction {
 icon: React.ComponentType<{ className?: string }>;
 label: string;
 action: () => void;
 color?: string;
}

interface MobileFloatingActionButtonProps {
 primaryAction: () => void;
 secondaryActions?: FABAction[];
}

export const MobileFloatingActionButton: React.FC<
 MobileFloatingActionButtonProps
> = ({ primaryAction, secondaryActions = [] }) => {
 const [isExpanded, setIsExpanded] = useState(false);

 const defaultActions: FABAction[] = [
  {
   icon: Swords,
   label: 'Thách đấu',
   action: () => console.log('Challenge created'),
   color: 'bg-warning-500 hover:bg-orange-600',
  },
  {
   icon: Trophy,
   label: 'Tạo giải',
   action: () => console.log('Tournament created'),
   color: 'bg-info-500 hover:bg-purple-600',
  },
  {
   icon: Camera,
   label: 'Chia sẻ',
   action: () => console.log('Share content'),
   color: 'bg-success-500 hover:bg-success-600',
  },
 ];

 const actions =
  secondaryActions.length > 0 ? secondaryActions : defaultActions;

 const handlePrimaryAction = () => {
  if (isExpanded) {
   setIsExpanded(false);
  } else if (actions.length > 0) {
   setIsExpanded(true);
  } else {
   primaryAction();
  }
 };

 const handleSecondaryAction = (action: FABAction) => {
  action.action();
  setIsExpanded(false);
 };

 return (
  <div className='mobile-fab-container'>
   {/* Secondary Actions */}
   {isExpanded && (
    <div className='mobile-fab-secondary'>
     {actions.map((action, index) => (
      <Button
       key={index}
       className={`fab-action ${action.color || 'bg-primary hover:bg-primary/90'} text-var(--color-background) shadow-lg`}
       
       onClick={() => handleSecondaryAction(action)}
      >
       <action.icon className='w-4 h-4 mr-2' />
       <span className='text-body-small-medium'>{action.label}</span>
      </Button>
     ))}
    </div>
   )}

   {/* Primary FAB */}
   <Button
    className='mobile-fab-primary'
    
    onClick={handlePrimaryAction}
   >
    {isExpanded ? (
     <X className='w-6 h-6 text-var(--color-background)' />
    ) : (
     <Plus className='w-6 h-6 text-var(--color-background)' />
    )}
   </Button>

   {/* Backdrop */}
   {isExpanded && (
    <div
     className='mobile-fab-backdrop'
     onClick={() => setIsExpanded(false)}
    />
   )}
  </div>
 );
};

export default MobileFloatingActionButton;
