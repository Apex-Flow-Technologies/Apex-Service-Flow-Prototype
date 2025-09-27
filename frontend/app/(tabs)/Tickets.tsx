import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { label: 'Completed', value: 'completed' },
  { label: 'On Progress', value: 'onprogress' },
];

const TICKETS = [
  {
    id: 1,
    title: 'Machine Break down',
    date: '16-04-2025',
    status: 'open',
    tab: 'onprogress',
  },
  {
    id: 2,
    title: 'Machine Break down',
    date: '16-06-2025',
    status: 'open',
    tab: 'onprogress',
  },
  {
    id: 3,
    title: 'Fault on Machine',
    date: '24-02-2025',
    status: 'closed',
    tab: 'completed',
  },
  {
    id: 4,
    title: 'Fault on Machine',
    date: '06-08-2025',
    status: 'in progress',
    tab: 'onprogress',
  },
];

const STATUS_COLORS = {
  open: '#2ecc40',
  closed: '#222',
  'in progress': '#1e90ff',
};

function StatusBadge({ status }: { status: string }) {
  const color = (STATUS_COLORS as Record<string, string>)[status] || '#aaa';
  return (
    <View style={[styles.statusBadge, { backgroundColor: color }]}> 
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  );
}

function TicketCard({ ticket }: { ticket: typeof TICKETS[0] }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.checkBox} />
        <View>
          <Text style={styles.cardTitle}>{ticket.title}</Text>
          <Text style={styles.cardDate}>{ticket.date}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <StatusBadge status={ticket.status} />
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Tickets() {
  const [activeTab, setActiveTab] = useState('onprogress');
  const filteredTickets = TICKETS.filter(t => t.tab === activeTab);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <Text style={styles.header}>Request List</Text>
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 24 }}>
        {filteredTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECF5',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
    color: '#222',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  tabActive: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1e90ff',
    borderWidth: 1,
  },
  tabText: {
    color: '#555',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1e90ff',
  },
  list: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1e90ff',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  cardDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
  viewButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});