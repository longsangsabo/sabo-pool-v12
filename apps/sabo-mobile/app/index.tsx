import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function IndexPage() {
  const { isAuthenticated, loading, user } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app start
    console.log('App starting, auth state:', { isAuthenticated, user: user?.email });
  }, []);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#000'
      }}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Đang tải...</Text>
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
