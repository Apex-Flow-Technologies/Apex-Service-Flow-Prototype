import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Home, Ticket, SquarePlus, CircleUser } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, AppState, View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';

let NavigationBar: any = null;
try {
  NavigationBar = require('expo-navigation-bar');
} catch (e) {
  NavigationBar = null;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 64;

  // Colors
  const TAB_BAR_COLOR = '#2196F3';   // blue tab footer
  const SYSTEM_NAV_BG = '#FFFFFF';   // white system navigation background
  const ACTIVE_COLOR = '#FFFFFF';    // active icon
  const INACTIVE_COLOR = 'rgba(255,255,255,0.6)';

  const applyNavStyle = async () => {
    if (Platform.OS !== 'android') return;
    try {
      if (NavigationBar?.setButtonStyle) {
        await NavigationBar.setButtonStyle('dark'); // dark system buttons
      }
      if (NavigationBar?.setBackgroundColorAsync) {
        await NavigationBar.setBackgroundColorAsync(SYSTEM_NAV_BG); // white nav background
      }
    } catch (err) {
      console.warn('NavigationBar style apply failed:', err);
    }
  };

  useEffect(() => {
    applyNavStyle();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // 🕐 Small delay to ensure it applies AFTER app resumes rendering
        setTimeout(applyNavStyle, 300);
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <>
      {/* white strip behind system nav buttons */}
      <View
        style={[
          styles.systemNavStrip,
          {
            backgroundColor: SYSTEM_NAV_BG,
            height: insets.bottom || 24,
          },
        ]}
        pointerEvents="none"
      />

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
            backgroundColor: TAB_BAR_COLOR,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            elevation: 0,
            shadowColor: 'transparent',
            zIndex: 10,
          },
          tabBarActiveTintColor: ACTIVE_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 11,
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
          name="Tickets"
          options={{
            title: 'Tickets',
            tabBarIcon: ({ color }) => <Ticket color={color} size={26} />,
          }}
        />
        <Tabs.Screen
          name="RaiseTicket"
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
    </>
  );
}

const styles = StyleSheet.create({
  systemNavStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
