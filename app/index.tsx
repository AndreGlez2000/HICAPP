import { Redirect } from 'expo-router';
import { useHicStore } from '../store';

/**
 * Entry point redirect guard.
 * Waits for DB hydration before deciding where to navigate.
 * - isHydrated === false → render nothing (splash screen is still visible)
 * - onboarding_complete === 1 → go to tabs (dashboard)
 * - otherwise → go to onboarding flow
 */
export default function Index() {
  const user = useHicStore((s) => s.user);
  const isHydrated = useHicStore((s) => s.isHydrated);

  // Still loading from SQLite — don't navigate yet
  if (!isHydrated) return null;

  if (user && user.onboarding_complete === 1) {
    return <Redirect href="/(tabs)/metas" />;
  }

  return <Redirect href="/onboarding" />;
}
