import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';

export default function MyTasksScreen() {
  const router = useRouter();
  
  // 1. Updated Tab State to include 'Declined'
  const [activeTab, setActiveTab] = useState<'New' | 'Active' | 'Declined'>('New');

  const [newTickets, setNewTickets] = useState<any[]>([]);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [declinedTickets, setDeclinedTickets] = useState<any[]>([]);

  const formatTicketId = (ticketId: number | string) =>
    `#${String(ticketId).padStart(4, '0')}`;

  /* --------------------------------------------------
      🔥 FETCH TICKETS FROM FIRESTORE
     -------------------------------------------------- */
  useEffect(() => {
    let unsubscribe: any;

    const fetchTickets = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      if (!userStr) return;

      const user = JSON.parse(userStr);

      // Query tickets assigned to this technician
      const q = query(
        collection(db, 'tickets'),
        where('assignedToId', '==', user.username)
      );

      unsubscribe = onSnapshot(q, snapshot => {
        const assigned: any[] = [];
        const inProgress: any[] = [];
        const declined: any[] = [];

        snapshot.forEach(docSnap => {
          const d = docSnap.data();

          const ticket = {
            id: docSnap.id,
            ticketId: d.ticketId,
            title: d.description || 'No description',
            customer: d.userName || 'Customer',
            address: 'xxxx', // Replace with real data field if available
            distance: 'xxxx',
            date: 'xxxx',
            startedAt: d.startedAt
              ? new Date(d.startedAt.toDate()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'xxxx',
          };

          // Categorize tickets based on status
          if (d.status === 'assigned') {
            assigned.push(ticket);
          } else if (d.status === 'in progress') {
            inProgress.push(ticket);
          } else if (d.status === 'declined') {
            declined.push(ticket);
          }
          // 'closed' tickets are ignored in this specific view
        });

        setNewTickets(assigned);
        setActiveTickets(inProgress);
        setDeclinedTickets(declined);
      });
    };

    fetchTickets();
    return () => unsubscribe && unsubscribe();
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const handleCall = () => {
    Linking.openURL('tel:1234567890');
  };

  const handleMap = (address: string) => {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  // Action: Accept Job -> Moves to "Active"
  const handleAcceptJob = async (ticket: any) => {
    try {
      await updateDoc(doc(db, 'tickets', ticket.id), {
        status: 'in progress',
        startedAt: new Date(),
      });
      // Optional: Auto-navigate to details
      // router.push({ pathname: '/ticket-detail/[id]', params: { id: ticket.id } });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to accept the job');
    }
  };

  // Action: Decline Job -> Moves to "Declined"
  const handleDeclineJob = async (ticket: any) => {
    Alert.alert(
      'Decline Job',
      'Are you sure you want to decline this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'tickets', ticket.id), {
                status: 'declined',
                declinedAt: new Date(),
                
              });
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to decline job');
            }
          },
        },
      ]
    );
  };

  // Action: Complete Job -> Moves to Closed (History)
  const handleCompleteJob = async (ticket: any) => {
    Alert.alert(
      'Mark Complete',
      'Have you finished all work for this ticket?',
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'tickets', ticket.id), {
                status: 'waiting_for_confirmation',
                completedAt: new Date(),
              });
              Alert.alert('Success', 'Job marked as complete!');
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to complete job');
            }
          },
        },
      ]
    );
  };

  /* ---------------- RENDER ITEM ---------------- */

  const renderTicketItem = ({ item }: { item: any }) => {
    const isNew = activeTab === 'New';
    const isActive = activeTab === 'Active';
    const isDeclined = activeTab === 'Declined';

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>
            Ticket ID {formatTicketId(item.ticketId)}
          </Text>

          {isNew && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={12} color="#666" />
              <Text style={styles.dateLabel}>{item.date || 'Today'}</Text>
            </View>
          )}
          {isActive && (
            <View style={[styles.badge, styles.badgeActive]}>
              <Text style={styles.badgeTextActive}>In Progress</Text>
            </View>
          )}
          {isDeclined && (
            <View style={[styles.badge, styles.badgeDeclined]}>
              <Text style={styles.badgeTextDeclined}>Declined</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.customerName}>{item.customer}</Text>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.addressText}>xxxx</Text>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          {isNew ? (
            <Text style={styles.metaText}>
              <Ionicons name="navigate-outline" size={14} /> xxxx away • Due: xxxx
            </Text>
          ) : isActive ? (
            <Text style={styles.metaText}>
              <Ionicons name="time-outline" size={14} /> Started at: {item.startedAt}
            </Text>
          ) : (
            <Text style={styles.metaText}>
              <Ionicons name="close-circle-outline" size={14} /> Job Declined
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Actions Row */}
        <View style={styles.actionRow}>
          {/* Common Buttons (Call/Map) - hidden for declined if desired, keeping for reference */}
          {!isDeclined && (
            <>
              <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color="#555" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleMap('xxxx')}
              >
                <Ionicons name="map-outline" size={20} color="#555" />
              </TouchableOpacity>
            </>
          )}

          {/* --- NEW TAB BUTTONS (Decline & Accept) --- */}
          {isNew && (
            <>
              <TouchableOpacity
                style={[styles.mainButton, styles.btnDecline]}
                onPress={() => handleDeclineJob(item)}
              >
                <Text style={styles.mainButtonText}>Decline</Text>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mainButton, styles.btnStart]}
                onPress={() => handleAcceptJob(item)}
              >
                <Text style={styles.mainButtonText}>Accept</Text>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* --- ACTIVE TAB BUTTONS (Done & Continue) --- */}
          {isActive && (
            <>
              <TouchableOpacity
                style={[styles.mainButton, styles.btnComplete]}
                onPress={() => handleCompleteJob(item)}
              >
                <Text style={styles.mainButtonText}>Done</Text>
                <Ionicons name="checkmark-done" size={16} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mainButton, styles.btnContinue]}
                onPress={() =>
                  router.push({
                    pathname: '/ticket-detail/[id]',
                    params: { id: item.id },
                  })
                }
              >
                {/* Just an arrow for "view details" */}
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* --- DECLINED TAB (Read Only) --- */}
          {isDeclined && (
             <View style={{flex: 1, alignItems: 'center'}}>
                 <Text style={{color: '#999', fontSize: 12, fontStyle:'italic'}}>No actions available</Text>
             </View>
          )}
        </View>
      </View>
    );
  };

  /* ---------------- DATA SELECTION ---------------- */
  const getDataForTab = () => {
    switch (activeTab) {
      case 'New': return newTickets;
      case 'Active': return activeTickets;
      case 'Declined': return declinedTickets;
      default: return [];
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Tasks</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          {['New', 'Active', 'Declined'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={getDataForTab()}
          keyExtractor={(item) => item.id}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 50}}>
                <Text style={{color: '#aaa', fontSize: 16}}>No tickets in {activeTab}</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8ECF5' },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#212121' },
  
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#2E86DE' },
  tabText: { fontWeight: '600', color: '#757575', fontSize: 12 },
  activeTabText: { color: '#fff' },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketId: { fontSize: 12, fontWeight: '700', color: '#9E9E9E' },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateLabel: { fontSize: 11, fontWeight: '600', color: '#555' },
  
  // Badges
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeActive: { backgroundColor: '#E3F2FD' },
  badgeTextActive: { fontSize: 10, fontWeight: '700', color: '#1976D2' },
  badgeDeclined: { backgroundColor: '#FFEBEE' },
  badgeTextDeclined: { fontSize: 10, fontWeight: '700', color: '#D32F2F' },

  ticketTitle: { fontSize: 16, fontWeight: '700', color: '#212121' },
  customerName: { fontSize: 14, color: '#555' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 13, color: '#757575', marginLeft: 4 },
  infoRow: { marginBottom: 12 },
  metaText: { fontSize: 12, color: '#8A8A8A', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginBottom: 12 },
  
  // Buttons
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  mainButtonText: { color: '#fff', fontWeight: '600', fontSize: 12, marginRight: 4 },
  
  // Button Colors
  btnStart: { backgroundColor: '#2E86DE' },
  btnDecline: { backgroundColor: '#D32F2F', marginRight: 5 },
  btnContinue: { backgroundColor: '#2E86DE', maxWidth: 50 }, // Small button for details arrow
  btnComplete: { backgroundColor: '#43A047', marginRight: 5 },
});