import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ---------------------------------------------------- */

export default function HistoryScreen() {
  const router = useRouter();

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  /* ---------- HELPERS ---------- */

  const formatTicketId = (id: number) =>
    `Ticket ID #${String(id).padStart(4, '0')}`;

  const getTitleFromDescription = (desc: string) =>
    desc.split(' ').slice(0, 3).join(' ');

  const getShortDescription = (desc: string) =>
    desc.split(' ').slice(0, 8).join(' ') + '...';

  const formatCompletedAt = (timestamp: any) => {
    if (!timestamp?.toDate) return 'N/A';

    const date = timestamp.toDate();
    const now = new Date();

    const isToday =
      date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;

    return date.toLocaleDateString();
  };

  /* ---------- FETCH HISTORY ---------- */

  useEffect(() => {
    let unsub: (() => void) | null = null;

    const fetchHistory = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user?.id) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'tickets'),
        where('assignedToId', '==', user.username),
        where('status', 'in', ['waiting_for_confirmation', 'closed']),
        orderBy('completedAt', 'desc')
      );

      unsub = onSnapshot(q, snap => {
        const list = snap.docs.map(doc => {
          const d = doc.data() as any;

          return {
            id: doc.id,
            ticketId: formatTicketId(d.ticketId),
            title: getTitleFromDescription(d.description || ''),
            location: 'xxx',
            description: getShortDescription(d.description || ''),
            completedAt: formatCompletedAt(d.completedAt),
            rawStatus: d.status,
          };
        });

        setHistoryData(list);
        setLoading(false);
      });
    };

    fetchHistory();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  /* ---------- SEARCH ---------- */

  const filteredData = historyData.filter(item =>
    item.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCompleted = historyData.filter(
    t => t.rawStatus === 'closed'
  ).length;

  /* ---------- RENDER ITEM ---------- */

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isClosed = item.rawStatus === 'closed';

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>{item.ticketId}</Text>
          <View
            style={[
              styles.statusBadge,
              isClosed ? styles.statusClosed : styles.statusPending,
            ]}
          >
            <Ionicons
              name={isClosed ? 'checkmark-circle' : 'hourglass'}
              size={12}
              color={isClosed ? '#2E7D32' : '#F57C00'}
            />
            <Text
              style={[
                styles.statusText,
                isClosed ? styles.textClosed : styles.textPending,
              ]}
            >
              {isClosed ? 'Closed' : 'Pending Approval'}
            </Text>
          </View>
        </View>

        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.customerName}>{item.location}</Text>

        <View style={styles.resolutionContainer}>
          <Ionicons
            name="checkbox-outline"
            size={16}
            color="#757575"
            style={{ marginTop: 2 }}
          />
          <Text style={styles.resolutionText}>
            {item.description}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            Finished: {item.completedAt}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#B0B0B0"
          />
        </View>
      </TouchableOpacity>
    );
  };

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Job History</Text>
          <Text style={styles.headerSubtitle}>
            Total Completed: {totalCompleted}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#9E9E9E"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ID, Title or Customer..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1e90ff"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={60}
                  color="#ccc"
                />
                <Text style={styles.emptyText}>
                  No history found
                </Text>
              </View>
            }
          />
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketId: { fontSize: 13, fontWeight: '700', color: '#9E9E9E' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusClosed: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  textClosed: { color: '#2E7D32' },
  textPending: { color: '#E65100' },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  customerName: { fontSize: 14, color: '#555', marginBottom: 10 },
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
  },
  dateText: { fontSize: 12, color: '#8A8A8A' },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
  emptyText: { marginTop: 10, fontSize: 16 },
});
