import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock Data: Mix of Resolved (Waiting) and Closed (Done)
const historyData = [
  { 
    id: 'TCK-1039', 
    title: 'CCTV Adjustments', 
    customer: 'Main Gate Security', 
    address: 'Gate 1, North Wing',
    completedAt: 'Today, 09:00 AM',
    status: 'Pending Approval', // Tech finished, Manager hasn't closed yet
    resolution: 'Re-aligned camera angle and cleaned lens.'
  },
  { 
    id: 'TCK-1035', 
    title: 'Projector Bulb Replacement', 
    customer: 'Conference Room A', 
    address: '3rd Floor, Corporate Block',
    completedAt: 'Yesterday, 04:30 PM',
    status: 'Closed', // Manager Approved
    resolution: 'Replaced bulb and tested HDMI input.'
  },
  { 
    id: 'TCK-1022', 
    title: 'Wifi Router Reset', 
    customer: 'Finance Dept', 
    address: '2nd Floor, Wing B',
    completedAt: '05 Mar 2025',
    status: 'Closed',
    resolution: 'Firmware updated and restarted.'
  },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic for search
  const filteredData = historyData.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isClosed = item.status === 'Closed';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/ticket-detail/[id]',
          params: { id: item.id }
        })} 
      >
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>{item.id}</Text>
          <View style={[styles.statusBadge, isClosed ? styles.statusClosed : styles.statusPending]}>
            <Ionicons 
              name={isClosed ? "checkmark-circle" : "hourglass"} 
              size={12} 
              color={isClosed ? "#2E7D32" : "#F57C00"} 
            />
            <Text style={[styles.statusText, isClosed ? styles.textClosed : styles.textPending]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.customerName}>{item.customer}</Text>

        <View style={styles.resolutionContainer}>
          <Ionicons name="checkbox-outline" size={16} color="#757575" style={{marginTop: 2}}/>
          <Text style={styles.resolutionText} numberOfLines={2}>
            {item.resolution}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Finished: {item.completedAt}</Text>
          <Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header - MODIFIED */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Job History</Text>
            <Text style={styles.headerSubtitle}>Total Completed: {historyData.length}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9E9E9E" style={styles.searchIcon} />
            <TextInput 
                style={styles.searchInput}
                placeholder="Search ID, Title or Customer..."
                placeholderTextColor="#9E9E9E"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No history found</Text>
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
  // --- MODIFIED HEADER STYLES START ---
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,        // Increased Padding
    paddingBottom: 20,     // Adjusted Bottom Padding
    backgroundColor: '#E8ECF5',
    alignItems: 'center',  // Center Align Items
    justifyContent: 'center',
  },
  // --- MODIFIED HEADER STYLES END ---
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  // List Styles
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E9E9E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusClosed: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  textClosed: {
    color: '#2E7D32',
  },
  textPending: {
    color: '#E65100',
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
    marginBottom: 10,
  },
  resolutionContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  resolutionText: {
    fontSize: 13,
    color: '#424242',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  }
});