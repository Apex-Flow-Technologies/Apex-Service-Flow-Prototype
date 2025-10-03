import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Home, Ticket, SquarePlus, CircleUser } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { Platform } from 'react-native';

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
    // Only run on Android and when expo-navigation-bar is available.
    if (Platform.OS === 'android' && NavigationBar && NavigationBar.setBackgroundColorAsync) {
      try {
        // Set nav bar background color to match the app footer and use light
        // button style so icons are white on the blue background.
        NavigationBar.setBackgroundColorAsync('#2196F3');
        if (NavigationBar.setButtonStyle) NavigationBar.setButtonStyle('light');
      } catch (e) {
        // Best-effort only; swallow errors.
      }
    }

    return () => {
      // Reset to a neutral background on unmount if API available.
      if (Platform.OS === 'android' && NavigationBar && NavigationBar.setBackgroundColorAsync) {
        try {
          NavigationBar.setBackgroundColorAsync('#FFFFFF');
          if (NavigationBar.setButtonStyle) NavigationBar.setButtonStyle('dark');
        } catch (e) {
          // ignore
        }
      }
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
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: 'transparent',
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
        },
        
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 11,
          marginTop: 0,
          marginBottom: 6,
        },
        
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={22}/>, 
          // OPTION: Apply padding to content of individual screens if they scroll
          // and need to clear the tab bar.
          // For most screens, you'd apply this to the main View/ScrollView style.
          // example: style={{ paddingBottom: TAB_BAR_TOTAL_HEIGHT }}
        }}
      />
      <Tabs.Screen
        name="Tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => <Ticket color={color} size={22} />, 
        }}
      />
      <Tabs.Screen
        name="RaiseTicket"
        options={{
          title: 'Raise Ticket',
          tabBarIcon: ({ color }) => <SquarePlus color={color} size={22}/>, 
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <CircleUser color={color} size={22}/>, 
        }}
      />
    </Tabs>
  );
}