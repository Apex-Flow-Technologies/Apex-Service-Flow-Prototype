import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
export const href = null;
export default function HelpSupport() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (!subject || !message) {
      Alert.alert('Please fill in all fields');
      return;
    }
    Alert.alert('Submitted', 'Your support request has been sent successfully.');
    setSubject('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Help & Support</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="e.g., Unable to raise ticket"
        />
        <Text style={styles.label}>Describe your issue or feedback</Text>
        <TextInput
          style={[styles.input, { height: 120 }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Write your feedback or issue..."
          multiline
        />
        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Submit Request</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8ECF5', padding: 16, paddingTop: 50 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  label: { color: '#333', fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
    color: '#333',
  },
  btn: {
    backgroundColor: '#1e90ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
