import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Static demo content for the Manager
const managerProfileImage = 'https://randomuser.me/api/portraits/men/75.jpg';

// Demo data for recent tickets, similar to your original component
const recentTickets = [
  { id: 'TCK-1042', title: 'Printer not working', status: 'New', customer: 'Jane Doe', date: '2025-03-08' },
  { id: 'TCK-1041', title: 'Email sync issue', status: 'In Progress', customer: 'John Smith', date: '2025-03-08' },
  { id: 'TCK-1039', title: 'Network latency', status: 'Waiting for Confirmation', customer: 'Acme Corp', date: '2025-03-08' },
];

// Helper function to get status styles
const getStatusStyles = (status: string) => {
  if (status === 'New') {
    return { text: styles.statusOpen, icon: 'alert-circle-outline', color: '#d32f2f' };
  }
  if (status === 'In Progress') {
    return { text: styles.statusInProgress, icon: 'sync-circle-outline', color: '#2E86DE' };
  }
  if (status === 'Waiting for Confirmation') {
    return { text: styles.statusWaiting, icon: 'time-outline', color: '#f59e0b' };
  }
  // Default for 'Closed'
  return { text: styles.statusClosed, icon: 'checkmark-circle-outline', color: '#43A047' };
};

export default function ManagerHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Profile Container */}
        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
            <View style={styles.profilePicWrapper}>
              <Image source={{ uri: managerProfileImage }} style={styles.profilePic} />
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={20} color="#2E86DE" />
              </View>
            </View>
            <View>
              <Text style={styles.userName}>Hello, Manager</Text>
              <Text style={styles.memberSince}>Manager Portal</Text>
            </View>
          </View>

          {/* Stats Section - Adapted for Manager */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={[styles.statCard, styles.statCardOpen]}>
              <Ionicons name="folder-open-outline" size={20} color="#FFA000" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>New Tickets</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, styles.statCardProgress]}>
              <Ionicons name="sync-circle-outline" size={20} color="#1976D2" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, styles.statCardCompleted]}>
              <Ionicons name="hourglass-outline" size={20} color="#388E3C" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pending Closure</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Container */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(managerTabs)/PendingTickets')}
            >
              <Ionicons name="person-add-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Assign Tickets</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => router.push('/(managerTabs)/Technician')} // Example route
            >
              <Ionicons name="people-outline" size={22} color="#2E86DE" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Manage Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tickets Container */}
        <View style={styles.ticketsContainer}>
          {/* Section header with "All Tickets" button */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tickets</Text>
            <TouchableOpacity onPress={() => router.push('/(managerTabs)/PendingTickets')}>
              <Text style={styles.viewAllText}>All Tickets →</Text>
            </TouchableOpacity>
          </View>

          {/* Map over the manager's recent tickets */}
          {recentTickets.map((ticket) => {
            const status = getStatusStyles(ticket.status);
            return (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketId}>{ticket.id} (from {ticket.customer})</Text>
                  <Ionicons name={status.icon as any} size={18} color={status.color} />
                </View>
                <Text style={styles.ticketSubject}>{ticket.title}</Text>
                <View style={styles.ticketCardFooter}>
                  <Text style={status.text}>{ticket.status}</Text>
                  <Text style={styles.ticketDate}>{ticket.date}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Spacer for tab bar */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles are copied from the Customer's HomeScreen and adapted
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8ECF5',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingTop: 40,
    paddingBottom: 0,
  },
  profileContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardOpen: {
    backgroundColor: '#FFF8E1',
  },
  statCardProgress: {
    backgroundColor: '#E3F2FD',
  },
  statCardCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#616161',
    marginTop: 2,
    fontWeight: '600',
  },
  // New Quick Actions styles
  quickActionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86DE',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#E3F2FD',
  },
  actionButtonTextSecondary: {
    color: '#2E86DE',
  },
  // Ticket list styles
  ticketsContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllText: {
    backgroundColor: '#2E86DE',
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicWrapper: {
    position: 'relative',
    marginRight: 18,
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 2,
    elevation: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  memberSince: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 3,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#222',
  },
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
  statusWaiting: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 13,
  },
  statusClosed: {
    color: '#43A047',
    fontWeight: '700',
    fontSize: 13,
  },
  ticketDate: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
  },
});
