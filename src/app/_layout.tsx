import { Anton_400Regular, useFonts } from '@expo-google-fonts/anton';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { configureNotificationHandler } from '@/lib/notifications';
import { useAuthSession } from '@/store/authSession';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({ Anton_400Regular });
  const initAuth = useAuthSession((s) => s.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="account" />
        <Stack.Screen name="onboarding/welcome" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding/notifications" options={{ gestureEnabled: false }} />
        <Stack.Screen name="quiz/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="quiz/results" options={{ gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
}
