import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();

  // Shared values for opacity and scale
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    // Start animations
    opacity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) });
    scale.value = withSpring(1, { damping: 12, stiffness: 120, mass: 0.8 });

    // After total 3 seconds, navigate to Login
    const timer = setTimeout(() => {
      router.replace('/(auth)/Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [opacity, scale, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, animatedStyle]}>
        <Image
          // Note: file present is a JPG in assets
          source={require('../assets/images/TBI Logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
});
