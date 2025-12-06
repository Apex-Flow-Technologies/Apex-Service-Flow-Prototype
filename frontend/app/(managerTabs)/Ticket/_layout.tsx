import { Stack } from 'expo-router';
import React from 'react';

export default function TicketStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
        contentStyle: {
          backgroundColor: '#E8ECF5',
        },
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
