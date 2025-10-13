import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Profile() {
  const router = useRouter();

  const handleSignOut = () => {
    router.replace('/(auth)/Login');
  };

  /**
   * --- THIS IS THE UPDATED CODE ---
   * The path is now simply `/profileNav/${screen}` because the `profileNav` folder
   * is a direct child of the `app` directory.
   */
  const handleNavigation = (screen: string) => {
    // @ts-ignore
    router.push(`/profileNav/${screen}`);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: 40 }]}>
      {/* Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="person" size={44} color="#fff" />
        </View>
        <View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@apexserviceflow.com</Text>
        </View>
      </View>

      {/* Options */}
      <View style={styles.section}>
        <ProfileItem icon="settings" label="Settings" onPress={() => handleNavigation('Settings')} />
        <ProfileItem icon="notifications" label="Notifications" onPress={() => handleNavigation('Notifications')} />
        <ProfileItem icon="help-outline" label="Help & Support" onPress={() => handleNavigation('HelpSupport')} />
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutRow} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={24} color="#ff3b30" style={{ marginRight: 12 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProfileItem({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.itemRow} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color="#1e90ff" style={{ marginRight: 16 }} />
      <Text style={styles.itemLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#bbb" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECF5',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
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
});