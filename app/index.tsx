import { Redirect } from 'expo-router';
import { useHicStore } from '../store';

/**
 * Entry point redirect guard.
 * - onboarding_complete === 1 → go to tabs (dashboard)
 * - otherwise → go to onboarding flow
 */
export default function Index() {
  const user = useHicStore((s) => s.user);

  if (user && user.onboarding_complete === 1) {
    return <Redirect href="/(tabs)/metas" />;
  }

  return <Redirect href="/onboarding" />;
}
