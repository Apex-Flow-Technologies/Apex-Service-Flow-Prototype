import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ALL_TICKETS, Ticket } from '../data/tickets';

export const href = null;

const statusColor: Record<Ticket['status'], string> = {
  Open: '#d32f2f',
  'In Progress': '#2E86DE',
  'Pending Closure': '#2E86DE',
  Closed: '#43A047',
};

const statusIcon: Record<Ticket['status'], string> = {
  Open: 'alert-circle',
  'In Progress': 'sync',
  'Pending Closure': 'time',
  Closed: 'checkmark-circle',
};

export default function ManagerTicketDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const ticket = useMemo(() => ALL_TICKETS.find(t => t.id === id), [id]);

  const handleBack = () => {
    // Always navigate directly back to PendingTickets page
    // Using replace ensures we go directly to Tickets page and clear the navigation stack
    router.replace('/(managerTabs)/PendingTickets');
  };

  useEffect(() => {
    if (!ticket) {
      handleBack();
    }
    // Cleanup: when component unmounts, ensure we're not leaving orphaned routes
    return () => {
      // Component cleanup
    };
  }, [ticket]);

  if (!ticket) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1e90ff" />
          </TouchableOpacity>
          <Text style={styles.header}>Ticket Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.ticketId}>{ticket.id}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor[ticket.status] }]}>
              <Ionicons name={statusIcon[ticket.status] as any} size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{ticket.status}</Text>
            </View>
          </View>

          <Text style={styles.title}>{ticket.title}</Text>

          <View style={styles.separator} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={18} color="#666" />
                <Text style={styles.infoLabel}>Customer</Text>
              </View>
              <Text style={styles.infoValue}>{ticket.customer}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.infoLabel}>Date</Text>
              </View>
              <Text style={styles.infoValue}>{ticket.date}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8ECF5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingTop: 50,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 12,
    paddingLeft: 0,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#363636',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 16,
    lineHeight: 28,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  infoValue: {
    color: '#212121',
    fontWeight: '700',
    fontSize: 15,
  },
});
