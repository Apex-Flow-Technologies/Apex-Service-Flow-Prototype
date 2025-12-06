import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Initial Mock Data (We use this to initialize the State)
const initialAssignedTickets = [
  { 
    id: 'TCK-2024', 
    title: 'AC Unit Leaking Water', 
    customer: 'Greenwood Apartments', 
    address: '45, Lake View Road, Block C', 
    distance: '2.5 km',
    date: '07 Dec 2025', 
    time: '10:00 AM'
  },
  { 
    id: 'TCK-2028', 
    title: 'Biometric Scanner Fault', 
    customer: 'Tech Park Reception', 
    address: 'Plot 101, IT Corridor', 
    distance: '5.0 km',
    date: '08 Dec 2025',
    time: '02:00 PM'
  },
];

const initialInProgressTickets = [
  { 
    id: 'TCK-1041', 
    title: 'Server Rack Overheating', 
    customer: 'Data Center B', 
    address: 'Basement Level 2, Main Building', 
    startedAt: '09:30 AM',
    status: 'In Progress'
  },
];

export default function MyTasksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'New' | 'Active'>('New');

  // 1. Convert static data to State so it can be modified
  const [newTickets, setNewTickets] = useState(initialAssignedTickets);
  const [activeTickets, setActiveTickets] = useState(initialInProgressTickets);

  const handleCall = () => {
    Linking.openURL('tel:1234567890');
  };

  const handleMap = (address: string) => {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if(url) Linking.openURL(url);
  };

  // 2. Logic to move ticket from New -> Active
  const handleAcceptJob = (ticket: any) => {
    // A. Remove from New List
    setNewTickets((prev) => prev.filter((t) => t.id !== ticket.id));

    // B. Create a modified ticket object for the Active list
    const newActiveTicket = {
      ...ticket,
      status: 'In Progress',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Set current time
    };

    // C. Add to Active List
    setActiveTickets((prev) => [newActiveTicket, ...prev]);

    // D. Automatically switch tabs to show the user the active job
    setActiveTab('Active');

    // E. Navigate to details (Optional: keep or remove if you just want to update list)
    router.push({
        pathname: '/ticket-detail/[id]',
        params: { id: ticket.id }
    });
  };

  const renderTicketItem = ({ item }: { item: any }) => {
    const isNew = activeTab === 'New';

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>{item.id}</Text>
          
          {isNew ? (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={12} color="#666" style={{marginRight: 4}} />
              <Text style={styles.dateLabel}>{item.date}</Text>
            </View>
          ) : (
             <View style={[styles.badge, styles.badgeActive]}>
              <Text style={styles.badgeTextActive}>In Progress</Text>
            </View>
          )}
        </View>

        {/* Title and Customer */}
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.customerName}>{item.customer}</Text>

        {/* Location Section */}
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
        </View>

        {/* Footer info */}
        <View style={styles.infoRow}>
            {isNew ? (
                <Text style={styles.metaText}>
                   <Ionicons name="navigate-outline" size={14} /> {item.distance} away • Due: {item.time}
                </Text>
            ) : (
                <Text style={styles.metaText}>
                   <Ionicons name="time-outline" size={14} /> Started at: {item.startedAt}
                </Text>
            )}
        </View>

        <View style={styles.divider} />

        {/* Actions Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="#555" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={() => handleMap(item.address)}>
            <Ionicons name="map-outline" size={20} color="#555" />
          </TouchableOpacity>

          {/* 3. Updated Button Logic */}
          <TouchableOpacity 
            style={[styles.mainButton, isNew ? styles.btnStart : styles.btnContinue]}
            onPress={() => {
                if (isNew) {
                    handleAcceptJob(item); // Call the move function
                } else {
                    // Normal navigation for "Continue Job"
                    router.push({
                        pathname: '/ticket-detail/[id]',
                        params: { id: item.id }
                    });
                }
            }}
          >
            <Text style={styles.mainButtonText}>
              {isNew ? 'Accept & Start' : 'Continue Job'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={{marginLeft: 5}} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Title */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>My Tasks</Text>
        </View>

        {/* Custom Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'New' && styles.activeTab]} 
            onPress={() => setActiveTab('New')}
          >
            <Text style={[styles.tabText, activeTab === 'New' && styles.activeTabText]}>
              New ({newTickets.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Active' && styles.activeTab]} 
            onPress={() => setActiveTab('Active')}
          >
            <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>
              Active ({activeTickets.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Updated FlatList Data Source */}
        <FlatList
          data={activeTab === 'New' ? newTickets : activeTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No tickets found</Text>
            </View>
          }
        />

      </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2E86DE',
  },
  tabText: {
    fontWeight: '600',
    color: '#757575',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#E3F2FD',
  },
  badgeTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1976D2',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 4,
    flex: 1,
  },
  infoRow: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mainButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnStart: {
    backgroundColor: '#2E86DE',
  },
  btnContinue: {
    backgroundColor: '#43A047',
  },
  mainButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  }
});