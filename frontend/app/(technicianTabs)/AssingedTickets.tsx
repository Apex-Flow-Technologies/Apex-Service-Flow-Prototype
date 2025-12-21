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
  const [activeTab, setActiveTab] = useState<'New' | 'Active'>('New');

  const [newTickets, setNewTickets] = useState<any[]>([]);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);

  const formatTicketId = (ticketId: number | string) =>
    `#${String(ticketId).padStart(4, '0')}`;

  /* --------------------------------------------------
     🔥 FETCH TICKETS FROM FIRESTORE (SOURCE OF TRUTH)
     -------------------------------------------------- */
  useEffect(() => {
    let unsubscribe: any;

    const fetchTickets = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      if (!userStr) return;

      const user = JSON.parse(userStr);

      const q = query(
        collection(db, 'tickets'),
        where('assignedToId', '==', user.username)
      );

      unsubscribe = onSnapshot(q, snapshot => {
        const assigned: any[] = [];
        const inProgress: any[] = [];

        snapshot.forEach(docSnap => {
          const d = docSnap.data();

          const ticket = {
            id: docSnap.id,
            ticketId: d.ticketId,
            title: d.description || 'No description',
            customer: d.userName || 'Customer',
            address: 'xxxx',
            distance: 'xxxx',
            date: 'xxxx',
            time: 'xxxx',
            startedAt: d.startedAt
              ? new Date(d.startedAt.toDate()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'xxxx',
          };

          if (d.status === 'assigned') {
            assigned.push(ticket);
          }

          if (d.status === 'in progress') {
            inProgress.push(ticket);
          }
        });

        setNewTickets(assigned);
        setActiveTickets(inProgress);
      });
    };

    fetchTickets();
    return () => unsubscribe && unsubscribe();
  }, []);

  /* -------------------------------------------------- */

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

  /* ---------------- ACCEPT JOB (FIXED) ---------------- */

  const handleAcceptJob = async (ticket: any) => {
    try {
      await updateDoc(doc(db, 'tickets', ticket.id), {
        status: 'in progress',
        startedAt: new Date(),
      });

      router.push({
        pathname: '/ticket-detail/[id]',
        params: { id: ticket.id },
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to start the job');
    }
  };

  /* ---------------- RENDER ---------------- */

  const renderTicketItem = ({ item }: { item: any }) => {
    const isNew = activeTab === 'New';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>
            Ticket ID {formatTicketId(item.ticketId)}
          </Text>

          {isNew ? (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={12} color="#666" />
              <Text style={styles.dateLabel}>{item.date}</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeActive]}>
              <Text style={styles.badgeTextActive}>In Progress</Text>
            </View>
          )}
        </View>

        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.customerName}>{item.customer}</Text>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.addressText}>xxxx</Text>
        </View>

        <View style={styles.infoRow}>
          {isNew ? (
            <Text style={styles.metaText}>
              <Ionicons name="navigate-outline" size={14} /> xxxx away • Due: xxxx
            </Text>
          ) : (
            <Text style={styles.metaText}>
              <Ionicons name="time-outline" size={14} /> Started at:{' '}
              {item.startedAt}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleMap('xxxx')}
          >
            <Ionicons name="map-outline" size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mainButton,
              isNew ? styles.btnStart : styles.btnContinue,
            ]}
            onPress={() =>
              isNew
                ? handleAcceptJob(item)
                : router.push({
                    pathname: '/ticket-detail/[id]',
                    params: { id: item.id },
                  })
            }
          >
            <Text style={styles.mainButtonText}>
              {isNew ? 'Accept & Start' : 'Continue Job'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Tasks</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'New' && styles.activeTab]}
            onPress={() => setActiveTab('New')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'New' && styles.activeTabText,
              ]}
            >
              New ({newTickets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
            onPress={() => setActiveTab('Active')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Active' && styles.activeTabText,
              ]}
            >
              Active ({activeTickets.length})
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === 'New' ? newTickets : activeTickets}
          keyExtractor={item => item.id}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

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
  tabText: { fontWeight: '600', color: '#757575' },
  activeTabText: { color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
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
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeActive: { backgroundColor: '#E3F2FD' },
  badgeTextActive: { fontSize: 10, fontWeight: '700', color: '#1976D2' },
  ticketTitle: { fontSize: 16, fontWeight: '700', color: '#212121' },
  customerName: { fontSize: 14, color: '#555' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 13, color: '#757575', marginLeft: 4 },
  infoRow: { marginBottom: 12 },
  metaText: { fontSize: 12, color: '#8A8A8A', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginBottom: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
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
  btnStart: { backgroundColor: '#2E86DE' },
  btnContinue: { backgroundColor: '#43A047' },
  mainButtonText: { color: '#fff', fontWeight: '600' },
});
