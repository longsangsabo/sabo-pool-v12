import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Loader2 } from 'lucide-react';

interface RoleRouteProps {
 children: React.ReactNode;
 requiredRole?: string;
 requiredRoles?: string[];
 requireAll?: boolean; // If true, user must have ALL roles. If false, user needs ANY role
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ 
 children, 
 requiredRole,
 requiredRoles,
 requireAll = false 
}) => {
 const { user, loading: authLoading } = useAuth();
 const { roles, isLoading: rolesLoading, hasRole, hasAnyRole, hasAllRoles } = useRoles();
 const location = useLocation();

 const loading = authLoading || rolesLoading;

 if (loading) {
  return (
   <div className='min-h-screen flex items-center justify-center bg-background'>
    <div className='text-center'>
     <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-primary' />
     <p className='text-muted-foreground'>Đang kiểm tra quyền truy cập...</p>
    </div>
   </div>
  );
 }

 if (!user) {
  return (
   <Navigate
    to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
    replace
   />
  );
 }

 // Check role requirements
 let hasRequiredPermission = false;

 if (requiredRole) {
  hasRequiredPermission = hasRole(requiredRole);
 } else if (requiredRoles && requiredRoles.length > 0) {
  hasRequiredPermission = requireAll 
   ? hasAllRoles(requiredRoles)
   : hasAnyRole(requiredRoles);
 } else {
  // No specific role required, just need to be authenticated
  hasRequiredPermission = true;
 }

 if (!hasRequiredPermission) {
  return (
   <div className='min-h-screen flex items-center justify-center bg-background p-4'>
    <div className='text-center'>
     <h2 className='text-heading-bold mb-4'>Không có quyền truy cập</h2>
     <p className='text-muted-foreground mb-4'>
      Bạn không có quyền để truy cập trang này.
     </p>
     <p className='text-body-small text-muted-foreground mb-4'>
      Quyền hiện tại: {roles.join(', ') || 'Không có'}
     </p>
     <p className='text-body-small text-muted-foreground mb-6'>
      Quyền yêu cầu: {requiredRole || requiredRoles?.join(requireAll ? ' và ' : ' hoặc ') || 'Không xác định'}
     </p>
     <div className='space-x-4'>
      <button
       onClick={() => window.history.back()}
       className='px-4 py-2 bg-neutral-500 text-white rounded hover:bg-gray-600'
      >
       Quay lại
      </button>
      <button
       onClick={() => window.location.href = '/dashboard'}
       variant="default"
      >
       Về Dashboard
      </button>
     </div>
    </div>
   </div>
  );
 }

 return <>{children}</>;
};

// Convenience components for common role checks
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <RoleRoute requiredRole="admin">{children}</RoleRoute>
);

export const ModeratorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <RoleRoute requiredRoles={['admin', 'moderator']}>{children}</RoleRoute>
);

export const ClubOwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <RoleRoute requiredRoles={['admin', 'club_owner']}>{children}</RoleRoute>
);

export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <RoleRoute requiredRoles={['admin', 'moderator', 'club_owner']}>{children}</RoleRoute>
);
