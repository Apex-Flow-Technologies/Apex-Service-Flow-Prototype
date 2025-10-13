import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const notifications = [
  { id: 1, title: 'Your ticket #123 has been closed.', status: 'closed', date: 'Oct 10, 2025' },
  { id: 2, title: 'Your ticket #122 is in process.', status: 'in-progress', date: 'Oct 8, 2025' },
  { id: 3, title: 'Your ticket #121 has been completed.', status: 'completed', date: 'Oct 5, 2025' },
];

const statusColors: Record<string, string> = {
  closed: '#ff3b30',
  'in-progress': '#1e90ff',
  completed: '#4cd964',
};

export default function Notifications() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {notifications.map(n => (
          <View key={n.id} style={styles.card}>
            <View style={[styles.badge, { backgroundColor: statusColors[n.status] }]}>
              <Text style={styles.badgeText}>{n.status}</Text>
            </View>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.date}>{n.date}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8ECF5', padding: 16, paddingTop: 50 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#222', textAlign: 'center', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: { color: '#fff', fontWeight: 'bold', textTransform: 'capitalize', fontSize: 12 },
  title: { color: '#222', fontWeight: '600', fontSize: 15, marginBottom: 4 },
  date: { color: '#888', fontSize: 13 },
});
