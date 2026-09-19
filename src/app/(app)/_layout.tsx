import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { colors } from '@/theme';

type TabIconName =
  'home-outline' | 'map-outline' | 'clipboard-outline' | 'star-outline' | 'person-outline';

function tabIcon(name: TabIconName) {
  return function TabIcon({ color, size }: Readonly<{ color: ColorValue; size: number }>) {
    return <Ionicons name={name} size={size} color={color} />;
  };
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
        },
        tabBarStyle: {
          height: 75,
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: tabIcon('home-outline'),
        }}
      />

      <Tabs.Screen
        name="green-points"
        options={{
          title: 'Mapa',
          tabBarIcon: tabIcon('map-outline'),
        }}
      />

      <Tabs.Screen
        name="my-raee"
        options={{
          title: 'Mis RAEE',
          tabBarIcon: tabIcon('clipboard-outline'),
        }}
      />

      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Recompensas',
          tabBarIcon: tabIcon('star-outline'),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: tabIcon('person-outline'),
        }}
      />
    </Tabs>
  );
}
