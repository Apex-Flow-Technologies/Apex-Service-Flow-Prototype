import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Profile() {
  const router = useRouter();

  const handleSignOut = () => {
    // Clear auth/session logic here
    router.replace('/(auth)/Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="person" size={60} color="#2196F3" />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@apexserviceflow.com</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <MaterialIcons name="settings" size={24} color="#2196F3" />
          <Text style={styles.label}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <MaterialIcons name="notifications" size={24} color="#2196F3" />
          <Text style={styles.label}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <MaterialIcons name="help-outline" size={24} color="#2196F3" />
          <Text style={styles.label}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={24} color="#FF3B30" />
          <Text style={[styles.label, { color: '#FF3B30' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8ECF5', padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  email: { fontSize: 14, color: '#555' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  label: { fontSize: 16, fontWeight: '500', color: '#222' },
});
