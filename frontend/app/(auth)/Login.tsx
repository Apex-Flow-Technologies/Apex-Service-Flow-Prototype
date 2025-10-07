import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const handleChange = (key: string, value: string | boolean) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = () => {
    // Dummy credentials
    const DUMMY_EMAIL = 'user@example.com';
    const DUMMY_PASSWORD = 'password123';
    if (form.email === DUMMY_EMAIL && form.password === DUMMY_PASSWORD) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password.');
    }
  };

  return (
    <View style={styles.container}>
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
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={form.email}
          onChangeText={v => handleChange('email', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={form.password}
          onChangeText={v => handleChange('password', v)}
        />
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleChange('remember', !form.remember)}
          >
            <View style={[styles.checkbox, form.remember && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
    marginVertical: 0,
  },
  welcomeText: {
    fontSize: 24,
    color: '#444',
    fontWeight: '700',
    fontFamily: 'System',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
    opacity: 0.95,
  },
  appText: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: '800',
    fontFamily: 'System',
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
    marginTop: 4,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  link: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});