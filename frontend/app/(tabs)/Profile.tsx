import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Profile() {
  const router = useRouter();
  const handleSignOut = () => {
    // Here you would clear auth state if implemented
    router.replace('/(auth)/Login');
  };
  return (
    <SafeAreaView style={[styles.container, { paddingTop: 20 }]}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="person" size={44} color="#fff" />
        </View>
        <View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@apexserviceflow.com</Text>
        </View>
      </View>
      <View style={styles.section}>
        <ProfileItem icon="settings" label="Settings" />
        <ProfileItem icon="notifications" label="Notifications" />
        <ProfileItem icon="help-outline" label="Help & Support" />
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutRow} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={24} color="#ff3b30" style={{ marginRight: 12 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.brand}>Apex Service Flow</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

function ProfileItem({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity style={styles.itemRow}>
      <MaterialIcons name={icon} size={24} color="#1e90ff" style={{ marginRight: 16 }} />
      <Text style={styles.itemLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#bbb" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
    padding: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 18,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 18,
    borderRadius: 12,
    marginHorizontal: 14,
    paddingVertical: 2,
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  itemLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 18,
  },
  brand: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  version: {
    color: '#888',
    fontSize: 13,
  },
});