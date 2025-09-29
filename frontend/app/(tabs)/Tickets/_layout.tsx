import { Stack } from 'expo-router';
import React from 'react';

export default function TicketsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{}} />
      <Stack.Screen name="[id]" options={{}} />
    </Stack>
  );
}
