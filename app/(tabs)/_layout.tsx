import { Tabs } from 'expo-router';
import { TabBar } from '../../components/chrome/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="metas/index"
        options={{
          title: 'Metas',
          tabBarIcon: () => null, // Icon is handled in TabBar.tsx, but user specifically asked to update here if it was standard
        }}
      />
      <Tabs.Screen
        name="dia/index"
        options={{
          title: 'Día',
        }}
      />
      <Tabs.Screen
        name="fotos/index"
        options={{
          title: 'Fotos',
        }}
      />
      <Tabs.Screen
        name="perfil/index"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
