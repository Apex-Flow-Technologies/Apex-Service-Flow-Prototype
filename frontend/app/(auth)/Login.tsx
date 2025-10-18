import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";


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
  ActivityIndicator, // <-- Import ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  // Add the new loading state
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  // Animation refs for each input
  const emailScale = useRef(new Animated.Value(1)).current;
  const passScale = useRef(new Animated.Value(1)).current;

  const handleFocus = (animRef: Animated.Value) => { //check here
    Animated.spring(animRef, {
      toValue: 1.03,
      useNativeDriver: true,
      speed: 15,
      bounciness: 10,
    }).start();
  };

  const handleBlur = (animRef: Animated.Value) => {//check here
    Animated.spring(animRef, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 6,
    }).start();
  };

  const handleChange = (key: string, value: string | boolean) => { //check here
    setForm({ ...form, [key]: value });
  };

  // UPDATED LOGIN FUNCTION
  const handleLogin = async () => {
    if (!form.username || !form.password) {
      Alert.alert("Missing Info", "Please enter both username and password.");
      return;
    }

    setIsLoading(true); // <-- Start loading

    try {
      // Query Firestore for the given username
      const q = query(collection(db, "user"), where("username", "==", form.username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Login Failed", "No user found with that username.");
        setIsLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.password !== form.password) {
        Alert.alert("Login Failed", "Incorrect password.");
        setIsLoading(false);
        return;
      }

      // ✅ Login successful
      const { role } = userData;

      // Redirect based on role (same as before)
      if (role === "manager") router.replace("/(managerTabs)");
      else if (role === "technician") router.replace("/(technicianTabs)");
      else if (role === "user") router.replace("/(tabs)");
      else Alert.alert("Unknown Role", "This account has no valid role assigned.");

    } catch (error) {
      console.log("Login failed:", error);
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
      setIsLoading(false);
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
          <Animated.View style={{ transform: [{ scale: emailScale }], marginBottom: 16 }}>
            <TextInput
              style={[styles.input, form.username.length > 0 && { borderColor: '#2196F3' }]}
              placeholder="Username"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={form.username}
              onChangeText={v => handleChange('username', v)}
              onFocus={() => handleFocus(emailScale)}
              onBlur={() => handleBlur(emailScale)}
            />
          </Animated.View>

          {/* Password Input with Eye Icon */}
          <Animated.View style={{ transform: [{ scale: passScale }], marginBottom: 16 }}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={v => handleChange('password', v)}
                onFocus={() => handleFocus(passScale)}
                onBlur={() => handleBlur(passScale)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
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

          {/* UPDATED Login Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Logging in...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// UPDATED STYLES
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 100,
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
    margin: 0,
  },
  eyeIcon: {
    marginLeft: 8,
    padding: 4,
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
    flexDirection: 'row', // <-- Added to align spinner and text
    justifyContent: 'center', // <-- Added to align spinner and text
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  // New style for the disabled button state
  buttonDisabled: {
    backgroundColor: '#90CAF9', // A lighter, disabled-looking color
    elevation: 0,
    shadowOpacity: 0,
  },
});