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
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
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
