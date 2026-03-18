import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/services/api';
import { ThemeContext, darkTheme } from './src/theme';
import { RootNavigator } from './src/navigation';
import { LogBox } from 'react-native';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';

if (!__DEV__) {
  LogBox.ignoreAllLogs(true);
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeContext.Provider value={{ theme: darkTheme }}>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
              <RootNavigator />
            </View>
          </QueryClientProvider>
        </ThemeContext.Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C111D', // Match theme background
  },
});
