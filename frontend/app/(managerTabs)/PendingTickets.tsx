import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// on line 118 create a slug for the ticket details
// 1. Defined a type for the Ticket object for TypeScript
interface Ticket {
  id: string;
  title: string;
  customer: string;
  status: 'Open' | 'In Progress' | 'Pending Closure' | 'Closed';
  date: string;
}

// Mock data for all tickets, now using the Ticket type
const ALL_TICKETS: Ticket[] = [
  { id: 'TCK-1042', title: 'Printer not working', customer: 'Jane Doe', status: 'Open', date: '2025-11-12' },
  { id: 'TCK-1041', title: 'Email sync issue', customer: 'John Smith', status: 'In Progress', date: '2025-11-11' },
  { id: 'TCK-1039', title: 'Network latency', customer: 'Acme Corp', status: 'Pending Closure', date: '2025-11-10' },
  { id: 'TCK-1038', title: 'Laptop Battery Dead', customer: 'Jane Doe', status: 'Closed', date: '2025-11-09' },
  { id: 'TCK-1037', title: 'Cannot access server', customer: 'Bob Johnson', status: 'In Progress', date: '2025-11-09' },
  { id: 'TCK-1036', title: 'New Software Request', customer: 'Alice Smith', status: 'Open', date: '2025-11-09' },
  { id: 'TCK-1035', title: 'PC setup for new hire', customer: 'HR Dept', status: 'Closed', date: '2025-11-08' },
];

const FILTER_TABS = ['New', 'In Progress', 'Closed'];

// Helper function to get status styles
const getStatusStyles = (status: Ticket['status']) => { // Used the type here
  if (status === 'Open') {
    return { text: styles.statusOpen, icon: 'alert-circle-outline', color: '#d32f2f' };
  }
  if (status === 'In Progress' || status === 'Pending Closure') {
    return { text: styles.statusInProgress, icon: 'sync-circle-outline', color: '#2E86DE' };
  }
  return { text: styles.statusClosed, icon: 'checkmark-circle-outline', color: '#43A047' };
};

export default function TicketsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(FILTER_TABS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter by Active Tab
  const ticketsByTab = useMemo(() => {
    if (activeTab === 'New') {
      return ALL_TICKETS.filter(t => t.status === 'Open');
    }
    if (activeTab === 'In Progress') {
      return ALL_TICKETS.filter(t => t.status === 'In Progress' || t.status === 'Pending Closure');
    }
    if (activeTab === 'Closed') {
      return ALL_TICKETS.filter(t => t.status === 'Closed');
    }
    return ALL_TICKETS;
  }, [activeTab]);

  // 2. Filter by Search Query
  const filteredTickets = useMemo(() => {
    if (!searchQuery) {
      return ticketsByTab; // Return tab-filtered list if search is empty
    }
    return ticketsByTab.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, ticketsByTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>All Tickets</Text>
      </View>

      {/* --- RE-ORDERED THIS SECTION --- */}

      {/* Search Bar (NOW FIRST) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, title, or customer..."
            placeholderTextColor="#8A8A8A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs (NOW SECOND) */}
      <View style={styles.filterContainer}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, activeTab === tab && styles.filterTabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.filterText, activeTab === tab && styles.filterTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* --- END RE-ORDERED SECTION --- */}


      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Ticket List */}
        {filteredTickets.map(ticket => {
          const status = getStatusStyles(ticket.status);
          return (
            <TouchableOpacity 
              key={ticket.id} 
              style={styles.ticketCard}
              // onPress={() => router.push({ pathname: '/(managerTabs)/TicketDetails', params: { id: ticket.id } })}
            >
              <View style={styles.ticketCardHeader}>
                <Text style={styles.ticketId}>{ticket.id} (from {ticket.customer})</Text>
                <Ionicons Name={status.icon} size={18} color={status.color} />
              </View>
              <Text style={styles.ticketSubject}>{ticket.title}</Text>
              <View style={styles.ticketCardFooter}>
                <Text style={status.text}>{ticket.status}</Text>
                <Text style={styles.ticketDate}>{ticket.date}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Show a message if no tickets are found */}
        {filteredTickets.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tickets found.</Text>
          </View>
        )}

        {/* Spacer for tab bar */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8ECF5',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16, 
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18, 
  },
  // Filter Tab Styles
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingBottom: 16,
    // This container now needs the border
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterTabActive: {
    backgroundColor: '#2E86DE',
  },
  filterText: {
    color: '#616161',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: 18,
    paddingTop: 16, // Added padding top
    backgroundColor: '#fff',
    paddingBottom: 16,
    // Removed border from here
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#212121',
  },
  // Ticket Card Styles (from Home screen)
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  ticketId: {
    fontWeight: '600',
    color: '#363636',
    fontSize: 14,
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '500',
    marginVertical: 8,
    color: '#252525',
  },
  ticketCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
  },
  // Status text styles
  statusOpen: {
    color: '#d32f2f',
    fontWeight: '700',
    fontSize: 13,
  },
  statusInProgress: {
    color: '#2E86DE',
    fontWeight: '700',
    fontSize: 13,
  },
  statusClosed: {
    color: '#43A047',
    fontWeight: '700',
    fontSize: 13,
  },
  // Empty State Styles
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8A8a',
  },
});