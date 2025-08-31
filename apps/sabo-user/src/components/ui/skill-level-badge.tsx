import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
 getSkillLevelStyle,
 getSkillLevelLabel,
} from '@/utils/skillLevelUtils';
import { ProfileData } from '@/types/profile';

interface SkillLevelBadgeProps {
 skillLevel: ProfileData['skill_level'];
 theme?: 'light' | 'dark';
 className?: string;
}

export const SkillLevelBadge: React.FC<SkillLevelBadgeProps> = ({
 skillLevel,
 theme = 'light',
 className = '',
}) => {
 return (
  <Badge
   variant='secondary'
   className={`${getSkillLevelStyle(skillLevel, theme)} ${className}`}
  >
   {getSkillLevelLabel(skillLevel)}
  </Badge>
 );
};
