import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';

export default function AssignedTickets() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.title}>Assigned Tickets</Text>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketId}>Ticket #123457</Text>
          <Text style={styles.ticketSubject}>Printer not working</Text>
          <Text style={styles.ticketStatus}>Assigned</Text>
        </View>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketId}>Ticket #123458</Text>
          <Text style={styles.ticketSubject}>Software Installation</Text>
          <Text style={styles.ticketStatus}>Assigned</Text>
        </View>
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
  ticketStatus: { fontWeight: '700', color: '#FF9800' },
});
