import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.header}>Welcome back to</Text>
        <Text style={styles.brand}>Apex Service Flow</Text>
      </View>
      <Text style={styles.subHeader}>Login to your account</Text>
      <View style={styles.formBox}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          value={form.email}
          onChangeText={v => handleChange('email', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
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
  header: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  subHeader: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e90ff',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#bbb',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#1e90ff',
    borderColor: '#1e90ff',
  },
  checkboxLabel: {
    color: '#888',
    fontSize: 14,
  },
  forgot: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1e90ff',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
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