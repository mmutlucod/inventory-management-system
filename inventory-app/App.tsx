import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from './src/providers';
import { AppNavigator } from './src/navigation';
import { useTheme } from './src/providers/theme-provider';

// Main App Component
const MainApp = () => {
  const { colorScheme } = useTheme();
  
  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <MainApp />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}