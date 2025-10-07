import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Home, Ticket, SquarePlus, CircleUser } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { Platform, AppState, View } from 'react-native';

// Try to require expo-navigation-bar at runtime. We do this so iOS and
// environments without the package won't crash during bundling.
let NavigationBar: any = null;
try {
  NavigationBar = require('expo-navigation-bar');
} catch (e) {
  NavigationBar = null;
}
if (!NavigationBar) {
  // created for the upcoming updates
  // Helpful runtime log so developers know the platform API is missing.
  // Metro logs will show this when running the app.
  // If you see this message, install the package with:
  //   expo install expo-navigation-bar
  // Then rebuild a dev client or standalone app to test.
  // (Expo Go won't surface native modules added after the app was built.)
  // eslint-disable-next-line no-console
  console.warn('[app/(tabs)/_layout] expo-navigation-bar is not installed or unavailable. System nav color change is disabled.');
}

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // No BOTTOM_MARGIN needed for a fixed-bottom bar, as it will sit flush with insets.
  const TAB_BAR_HEIGHT = 64;
  const BACKGROUND_COLOR = '#E8ECF5'; 
  
  // Calculate the total height the screen content needs to clear.
  // This is just the bar height + safe area bottom inset.
  const TAB_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + insets.bottom; 
  useEffect(() => {
    const setNavigationBarColor = () => {
      // Only run on Android and when expo-navigation-bar is available.
      if (Platform.OS === 'android' && NavigationBar && NavigationBar.setBackgroundColorAsync) {
        try {
          // Set nav bar to white background with dark (black) icons
          NavigationBar.setBackgroundColorAsync('#FFFFFF');
          if (NavigationBar.setButtonStyle) NavigationBar.setButtonStyle('dark');
        } catch (e) {
          // Best-effort only; swallow errors.
        }
      }
    };

    // Set initial color
    setNavigationBarColor();

    // Add app state change listener to reapply color when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setNavigationBarColor();
      }
    });

    // Only remove the app state listener, but let the navigation bar color persist
    return () => {
      subscription.remove();
    };
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
        
        tabBarIconStyle: {
          marginBottom: 0,
        },
        
        tabBarItemStyle: {
          paddingVertical: 6,
          backgroundColor: 'transparent',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="Tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => (
            <Ticket color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="RaiseTicket"
        options={{
          title: 'Raise Ticket',
          tabBarIcon: ({ color }) => (
            <SquarePlus color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <CircleUser color={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}