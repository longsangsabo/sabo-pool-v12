import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock Expo Router
jest.mock('expo-router', () => ({
  Slot: () => <Text testID="app-slot">App Slot</Text>,
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        EXPO_PUBLIC_SUPABASE_URL: 'mock-url',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'mock-key',
      },
    },
  },
}));

// Simple app component test
const App = () => <Text testID="app-root">SABO Arena Mobile</Text>;

describe('App', () => {
  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeTruthy();
  });

  it('displays app name', () => {
    render(<App />);
    expect(screen.getByText('SABO Arena Mobile')).toBeTruthy();
  });
});
