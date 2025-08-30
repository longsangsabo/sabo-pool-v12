import { SKILL_LEVELS } from '@/types/profile';

export const getSkillLevelStyle = (
  skillLevel: keyof typeof SKILL_LEVELS,
  theme: 'light' | 'dark' = 'light'
) => {
  const darkStyles = {
    beginner: 'bg-green-900/50 text-green-200 border border-green-800/50',
    intermediate: 'bg-blue-900/50 text-blue-200 border border-blue-800/50',
    advanced: 'bg-purple-900/50 text-purple-200 border border-purple-800/50',
    pro: 'bg-yellow-900/50 text-yellow-200 border border-yellow-800/50',
  };

  // Fallback to 'beginner' if skillLevel is invalid
  const safeSkillLevel =
    skillLevel && SKILL_LEVELS[skillLevel] ? skillLevel : 'beginner';

  return theme === 'dark'
    ? darkStyles[safeSkillLevel] || darkStyles.beginner
    : SKILL_LEVELS[safeSkillLevel]?.color || SKILL_LEVELS.beginner.color;
};

export const getSkillLevelLabel = (skillLevel: keyof typeof SKILL_LEVELS) => {
  return SKILL_LEVELS[skillLevel]?.label || SKILL_LEVELS.beginner.label;
};
