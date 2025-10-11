import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import type { Href } from 'expo-router';

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  // Animation refs for each input
  const emailScale = useRef(new Animated.Value(1)).current;
  const passScale = useRef(new Animated.Value(1)).current;

  const handleFocus = (animRef: Animated.Value) => {
    Animated.spring(animRef, {
      toValue: 1.03,
      useNativeDriver: true,
      speed: 15,
      bounciness: 10,
    }).start();
  };

  const handleBlur = (animRef: Animated.Value) => {
    Animated.spring(animRef, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 6,
    }).start();
  };

  const handleChange = (key: string, value: string | boolean) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = () => {
    const USERS = {
      user: { email: "user@example.com", password: "password123", route: '/(tabs)' },
      technician: { email: "technician@example.com", password: "password123", route: '/(technicianTabs)' },
      manager: { email: "manager@example.com", password: "password123", route: '/(managerTabs)' },
    } as const satisfies Record<string, { email: string; password: string; route: Href }>

    const matchedUser = Object.values(USERS).find(
      (u) => u.email === form.email && u.password === form.password
    )

    if (matchedUser) {
      router.replace(matchedUser.route)
    } else {
      Alert.alert('Login Failed', 'Invalid username or password.')
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Image
            source={require('../../assets/images/techno-bright-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appText}>Service Request App</Text>
        </View>

        <View style={styles.formBox}>
          <Text style={styles.subHeader}>Login to your account</Text>

          {/* Email Input */}
          <Animated.View style={{ transform: [{ scale: emailScale }] }}>
            <TextInput
              style={[
                styles.input,
                form.email.length > 0 && { borderColor: '#2196F3' },
              ]}
              placeholder="Email Address"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={form.email}
              onChangeText={v => handleChange('email', v)}
              onFocus={() => handleFocus(emailScale)}
              onBlur={() => handleBlur(emailScale)}
            />
          </Animated.View>

          {/* Password Input */}
          <Animated.View style={{ transform: [{ scale: passScale }] }}>
            <TextInput
              style={[
                styles.input,
                form.password.length > 0 && { borderColor: '#2196F3' },
              ]}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={form.password}
              onChangeText={v => handleChange('password', v)}
              onFocus={() => handleFocus(passScale)}
              onBlur={() => handleBlur(passScale)}
            />
          </Animated.View>

          {/* Remember Me + Forgot */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleChange('remember', !form.remember)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, form.remember && styles.checkboxChecked]}>
                {form.remember && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 60,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 350,
  },
  logoImage: {
    width: 280,
    height: 110,
  },
  welcomeText: {
    fontSize: 24,
    color: '#444',
    fontWeight: '700',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
    textAlign: 'center',
    opacity: 0.95,
  },
  appText: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  subHeader: {
    fontSize: 20,
    color: '#444',
    marginBottom: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkboxLabel: {
    color: '#666',
    fontSize: 15,
  },
  forgot: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
