import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { initDB } from '../db';
import { useHicStore } from '../store';
import { scheduleAllNotifications } from '../services/notifications';
import '../global.css';

// Prevent splash screen from auto-hiding before fonts + DB are ready
SplashScreen.preventAutoHideAsync();

// Foreground notification display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const loadFromDB = useHicStore((s) => s.loadFromDB);

  const [fontsLoaded, fontError] = useFonts({
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

  useEffect(() => {
    async function init() {
      try {
        await initDB();
        await loadFromDB();

        // Schedule local notifications (only if onboarding complete)
        const { user } = useHicStore.getState();
        if (user?.onboarding_complete === 1) {
          await scheduleAllNotifications();
        }
      } catch (e) {
        console.error('[HiC] init error:', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    if (fontsLoaded || fontError) {
      init();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
