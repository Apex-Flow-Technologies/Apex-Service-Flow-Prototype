import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Home, Ticket, SquarePlus, CircleUser } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, AppState } from 'react-native';

// Try to require expo-navigation-bar at runtime.
let NavigationBar: any = null;
try {
  NavigationBar = require('expo-navigation-bar');
} catch (e) {
  NavigationBar = null;
}
if (!NavigationBar) {
  console.warn('[app/(tabs)/_layout] expo-navigation-bar is not installed or unavailable. System nav color change is disabled.');
}

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 64;

  useEffect(() => {
    const setNavigationBarColor = () => {
      if (Platform.OS === 'android' && NavigationBar && NavigationBar.setBackgroundColorAsync) {
        try {
          NavigationBar.setBackgroundColorAsync('#FFFFFF');
          if (NavigationBar.setButtonStyle) NavigationBar.setButtonStyle('dark');
        } catch {}
      }
    };

    setNavigationBarColor();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setNavigationBarColor();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: '#2196F3',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 0,
          shadowColor: 'transparent',
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
          marginTop: 0,
          marginBottom: 6,
        },
        tabBarIconStyle: { marginBottom: 0 },
        tabBarItemStyle: { paddingVertical: 6, backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="AssingedTickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => <Ticket color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="CompletedJobs"
        options={{
          title: 'Raise Ticket',
          tabBarIcon: ({ color }) => <SquarePlus color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <CircleUser color={color} size={26} />,
        }}
      />
    </Tabs>
  );
}
