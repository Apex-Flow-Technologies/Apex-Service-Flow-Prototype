import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Ticket, SquarePlus, CircleUser } from "lucide-react-native";
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        // Rounded, floating-style blue tab bar
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64,
          borderRadius: 16,
          backgroundColor: '#2E86DE',
          borderTopWidth: 0,
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#dbe8ff',
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 12,
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size}/>, 
        }}
      />
      <Tabs.Screen
        name="Tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, size }) => <Ticket color={color} size={size} />, 
        }}
      />
      <Tabs.Screen
        name="RaiseTicket"
        options={{
          title: 'Raise Ticket',
          tabBarIcon: ({ color, size }) => <SquarePlus color={color} size={size}/>, 
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <CircleUser color={color} size={size}/>, 
        }}
      />
    </Tabs>
  );
}
