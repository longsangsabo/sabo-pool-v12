import React from 'react';
import { StandardCard, StandardButton, Heading, Text } from "@sabo/shared-ui";
import { Badge } from '@/components/ui/badge';

interface ClubStatusBadgeProps {
 status?: string;
 className?: string;
 role?: string;
 size?: 'sm' | 'md';
}

// Map status -> Tailwind + text
const STATUS_MAP: Record<string, { label: string; className: string }> = {
 owner: {
  label: 'Owner',
  className:
   'bg-gradient-to-r from-amber-500 to-amber-600 text-var(--color-background) shadow-sm',
 },
 moderator: {
  label: 'Mod',
  className:
   'bg-gradient-to-r from-blue-500 to-indigo-600 text-var(--color-background) shadow-sm',
 },
 admin: { label: 'Admin', className: 'bg-indigo-600 text-var(--color-background)' },
 member: {
  label: 'Thành viên',
  className: 'bg-slate-700 text-var(--color-background) dark:bg-slate-600',
 },
 pending: {
  label: 'Chờ duyệt',
  className: 'bg-amber-500 text-var(--color-background) animate-pulse',
 },
 rejected: { label: 'Từ chối', className: 'bg-rose-600 text-var(--color-background)' },
 removed: { label: 'Đã gỡ', className: 'bg-slate-500 text-var(--color-background)' },
};

export const ClubStatusBadge: React.FC<ClubStatusBadgeProps> = ({
 status = 'member',
 className = '',
 role,
 size = 'md',
}) => {
 const key = (role || status).toLowerCase();
 const conf = STATUS_MAP[key] || STATUS_MAP['member'];
 const sizeClass = size === 'sm' ? 'badge-sm' : 'badge-md';
 return (
  <Badge
   className={`mobile-badge-primary tracking-wide border-0 ${sizeClass} ${conf.className} ${className}`}
   data-label={conf.label}
   title={role ? `${conf.label}` : conf.label}
   data-role={role}
  />
 );
};

export default ClubStatusBadge;
