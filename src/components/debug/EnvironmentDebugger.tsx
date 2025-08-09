/**
 * Environment Debug Component
 * Hiển thị thông tin environment trong browser console
 */

import React, { useEffect } from 'react';

const EnvironmentDebugger: React.FC = () => {
  useEffect(() => {
    console.log('🔧 ===== ENVIRONMENT DEBUG =====');
    console.log('📍 Mode:', import.meta.env.MODE);
    console.log('🌍 DEV:', import.meta.env.DEV);
    console.log('🏭 PROD:', import.meta.env.PROD);
    console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🗝️  Supabase Key (first 20):', 
      import.meta.env.VITE_SUPABASE_ANON_KEY ? 
      import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 
      'NOT SET'
    );
    console.log('💰 VNPay TMN Code:', import.meta.env.VITE_VNPAY_TMN_CODE);
    console.log('🔧 ===========================');
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs opacity-50 z-50">
      ENV DEBUG: Check Console
    </div>
  );
};

export default EnvironmentDebugger;
