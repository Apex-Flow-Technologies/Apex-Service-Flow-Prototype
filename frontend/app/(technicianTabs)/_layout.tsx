import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Home, ClipboardList, History, CircleUser } from 'lucide-react-native'; // Updated icons
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
  console.warn('[app/(technicianTabs)/_layout] expo-navigation-bar is not installed. System nav color change disabled.');
}

import { HapticTab } from '@/components/haptic-tab';

export default function TechnicianTabLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 64;

  useEffect(() => {
    const setNavigationBarColor = () => {
      if (Platform.OS === 'android' && NavigationBar && NavigationBar.setBackgroundColorAsync) {
        try {
          // Set Android bottom nav bar to white to contrast with the blue Tab Bar
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
          backgroundColor: '#2196F3', // Primary Brand Blue
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 8, // Added slightly more elevation for depth
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
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
      {/* 1. Dashboard / Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />

      {/* 2. Active Work (Assigned Tickets) */}
      <Tabs.Screen
        name="AssingedTickets" // Matches your file name
        options={{
          title: 'My Tasks', // Display name for the Technician
          tabBarIcon: ({ color }) => <ClipboardList color={color} size={24} />,
        }}
      />

      {/* 3. Work Log (Completed Jobs) */}
      <Tabs.Screen
        name="CompletedJobs" // Matches your file name
        options={{
          title: 'History', // Changed from "Raise Ticket" to "History"
          tabBarIcon: ({ color }) => <History color={color} size={24} />,
        }}
      />

      {/* 4. Settings */}
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <CircleUser color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}