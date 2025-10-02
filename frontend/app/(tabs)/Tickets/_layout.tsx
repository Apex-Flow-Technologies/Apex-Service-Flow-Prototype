import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native'; // Import View

export default function TicketsStackLayout() {
  return (
    // Wrap the Stack in a View with the desired background color
    <View style={{ flex: 1, backgroundColor: '#E8ECF5' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
          contentStyle: {
            // Keep this here, even if it didn't fix it alone
            backgroundColor: '#E8ECF5',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            presentation: 'modal', // Use modal or card
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  );
}