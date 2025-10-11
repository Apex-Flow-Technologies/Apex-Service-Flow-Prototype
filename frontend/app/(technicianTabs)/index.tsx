import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.title}>Hello, John Doe</Text>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketId}>Ticket #123456</Text>
          <Text style={styles.ticketSubject}>Laptop Battery Issue</Text>
          <Text style={styles.ticketStatus}>In Progress</Text>
        </View>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketId}>Ticket #123455</Text>
          <Text style={styles.ticketSubject}>Warranty Query</Text>
          <Text style={styles.ticketStatus}>Closed</Text>
        </View>

        <TouchableOpacity
          style={styles.raiseBtn}
          onPress={() => router.push('/(tabs)/RaiseTicket')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.raiseBtnText}>Raise New Ticket</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8ECF5', padding: 18 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24, color: '#222' },
  ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14 },
  ticketId: { fontWeight: '600', color: '#222', marginBottom: 6 },
  ticketSubject: { fontSize: 16, marginBottom: 4 },
  ticketStatus: { fontWeight: '700', color: '#2E86DE' },
  raiseBtn: { flexDirection: 'row', backgroundColor: '#2E86DE', borderRadius: 20, padding: 14, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  raiseBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});
