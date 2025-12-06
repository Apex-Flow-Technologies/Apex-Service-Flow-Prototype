// it is used in the technician tabs to show ticket details based on the ticket ID passed in the URL

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams(); // Gets the ID (e.g., TCK-1042)
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>Ticket ID:</Text>
        <Text style={styles.value}>{id}</Text>
        <Text style={styles.description}>
            Full details for this ticket will be fetched here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  label: { fontSize: 16, color: '#666' },
  value: { fontSize: 22, fontWeight: 'bold', color: '#2E86DE', marginBottom: 10 },
  description: { fontSize: 16, color: '#444' },
});