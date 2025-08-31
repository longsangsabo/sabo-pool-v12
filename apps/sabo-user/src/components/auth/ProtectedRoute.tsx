import React from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";

interface ProtectedRouteProps {
 children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
 const { user, loading, session } = useAuth();
 const location = useLocation();

 // Extended loading state check
 if (loading) {
  return (
   <div className='min-h-screen flex items-center justify-center bg-background'>
    <div className='text-center'>
     <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-primary' />
     <p className='text-muted-foreground'>Đang xác thực...</p>
    </div>
   </div>
  );
 }

 // Check for both user and session for stronger authentication
 if (!user || !session) {
  console.log('🔧 ProtectedRoute: No user or session, redirecting to auth', {
   hasUser: !!user,
   hasSession: !!session,
   path: location.pathname,
  });

  // Clear any corrupted auth data
  if (!session) {
// // //    localStorage.removeItem('// TODO: Replace with service call - supabase.auth.token');
  }

  // Redirect to auth with return URL
  return (
   <Navigate
    to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
    replace
   />
  );
 }

 return <>{children}</>;
};
