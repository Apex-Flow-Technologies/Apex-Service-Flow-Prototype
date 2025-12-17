import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Static demo content for the Technician
const techProfileImage = 'https://randomuser.me/api/portraits/men/32.jpg';

// Demo data for Technician's specific assigned tickets
const mySchedule = [
  { id: 'TCK-1042', title: 'Printer not working', location: 'Block A, 2nd Floor', status: 'Assigned', time: '10:00 AM' },
  { id: 'TCK-1041', title: 'Server Room AC Leak', location: 'Server Room B', status: 'In Progress', time: '11:30 AM' },
  { id: 'TCK-1039', title: 'CCTV Adjustments', location: 'Main Gate', status: 'Resolved', time: '09:00 AM' }, // Resolved = Waiting for Manager Close
];

// Helper function to get status styles specific to Technician workflow
const getStatusStyles = (status : string) => {
  if (status === 'Assigned') {
    return { text: styles.statusAssigned, icon: 'alert-circle-outline', color: '#F57C00', label: 'New Task' };
  }
  if (status === 'In Progress') {
    return { text: styles.statusInProgress, icon: 'hammer-outline', color: '#2E86DE', label: 'Working' };
  }
  // 'Resolved' implies waiting for Manager approval
  return { text: styles.statusResolved, icon: 'checkmark-circle-outline', color: '#43A047', label: 'Pending Approval' };
};

export default function TechnicianHomeScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true); // Toggle for On Duty/Off Duty

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Profile & Availability Container */}
        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
            <View style={styles.profilePicWrapper}>
              <Image source={{ uri: techProfileImage }} style={styles.profilePic} />
              <View style={[styles.badge, { backgroundColor: isAvailable ? '#43A047' : '#B0BEC5' }]}>
                {/* Green dot for online, Gray for offline */}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Hello, Alex</Text>
              <Text style={styles.memberSince}>Technician Portal</Text>
            </View>
            {/* Availability Toggle */}
            <View style={styles.availabilityWrapper}>
                <Text style={styles.availabilityText}>{isAvailable ? 'On Duty' : 'Off Duty'}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isAvailable ? "#2E86DE" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => setIsAvailable(previousState => !previousState)}
                    value={isAvailable}
                    style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                />
            </View>
          </View>

          {/* Stats Section - Adapted for Technician Workflow */}
          <View style={styles.statsRow}>
            {/* Assigned / To Do */}
            <TouchableOpacity style={[styles.statCard, styles.statCardAssigned]}>
              <Ionicons name="clipboard-outline" size={20} color="#E65100" />
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Assigned</Text>
            </TouchableOpacity>

            {/* In Progress */}
            <TouchableOpacity style={[styles.statCard, styles.statCardProgress]}>
              <Ionicons name="construct-outline" size={20} color="#1565C0" />
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Active</Text>
            </TouchableOpacity>

            {/* Waiting for Manager Approval */}
            <TouchableOpacity style={[styles.statCard, styles.statCardCompleted]}>
              <Ionicons name="hourglass-outline" size={20} color="#2E7D32" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Reviewing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Container */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Work Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(technicianTabs)/AssingedTickets')}
            >
              <Ionicons name="list" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>My Tasks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]}
              // CORRECT
            onPress={() => router.push('/(technicianTabs)/CompletedJobs')}
            >
              <Ionicons name="time-outline" size={22} color="#2E86DE" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule / Tickets Container */}
        <View style={styles.ticketsContainer}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity onPress={() => router.push('/(technicianTabs)/AssingedTickets')}>
            <Text style={styles.viewAllText}>View Tickets →</Text>
          </TouchableOpacity>
          </View>

          {/* Map over the technician's schedule */}
          {mySchedule.map((ticket) => {
            const statusStyle = getStatusStyles(ticket.status);
            return (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketId}>{ticket.id}</Text>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                     <Ionicons Name={statusStyle.icon} size={16} color={statusStyle.color} style={{marginRight:4}} />
                     <Text style={[statusStyle.text, {fontSize: 12}]}>{statusStyle.label}</Text>
                  </View>
                </View>
                
                <Text style={styles.ticketSubject}>{ticket.title}</Text>
                
                <View style={styles.locationRow}>
                     <Ionicons name="location-sharp" size={14} color="#757575" />
                     <Text style={styles.locationText}>{ticket.location}</Text>
                </View>

                <View style={styles.ticketCardFooter}>
                <TouchableOpacity 
                  style={styles.openButton} 
                  onPress={() => router.push({
                    pathname: '/ticket-detail/[id]', // Explicitly points to the file
                    params: { id: ticket.id }        // Passes the ID safely
                  })}
                >
                  <Text style={styles.openButtonText}>Open Ticket</Text>
                  <Ionicons name="arrow-forward" size={14} color="#2E86DE" />
                </TouchableOpacity>
                <Text style={styles.ticketDate}>{ticket.time}</Text>
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

// Adapted Styles
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
    marginTop: 12, // Increased spacing
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardAssigned: {
    backgroundColor: '#FFF3E0', // Orange tint for Assigned
  },
  statCardProgress: {
    backgroundColor: '#E3F2FD', // Blue tint for Active
  },
  statCardCompleted: {
    backgroundColor: '#E8F5E9', // Green tint for Review
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#616161',
    marginTop: 2,
    fontWeight: '600',
  },
  // Availability Toggle Styles
  availabilityWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8A',
    marginBottom: 4,
  },
  // Quick Actions
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
  // Ticket List
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
    backgroundColor: '#F0F4F8',
    color: '#2E86DE',
    fontWeight: '600',
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePicWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  memberSince: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
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
    marginBottom: 6,
    alignItems: 'center',
  },
  ticketId: {
    fontWeight: '600',
    color: '#9E9E9E',
    fontSize: 12,
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginVertical: 6,
    color: '#252525',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
  },
  ticketCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openButtonText: {
    color: '#2E86DE',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 4,
  },
  statusAssigned: { color: '#F57C00', fontWeight: '700' },
  statusInProgress: { color: '#2E86DE', fontWeight: '700' },
  statusResolved: { color: '#43A047', fontWeight: '700' },
  ticketDate: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
  },
});