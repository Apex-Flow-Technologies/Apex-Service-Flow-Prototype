import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const TABS: { label: string; value: 'completed' | 'onprogress' }[] = [
  { label: 'Completed', value: 'completed' },
  { label: 'On Progress', value: 'onprogress' },
];

// Status color mapping
const statusColor: Record<string, string> = {
  open: '#4CAF50',
  'in progress': '#2196F3',
  closed: '#9E9E9E',
};

interface Ticket {
  id: string;
  title: string;
  date: string;
  status: 'open' | 'in progress' | 'closed';
}

function StatusBadge({ status }: { status: Ticket['status'] }) {
  const color = statusColor[status] || '#aaa';
  return (
    <View style={[styles.statusBadge, { backgroundColor: color }]}> 
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  );
}

function TicketCard({ ticket, onView }: { ticket: Ticket; onView: (id: string) => void }) {
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
        <TouchableOpacity style={styles.viewButton} onPress={() => onView(ticket.id)}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const normalizeStatus = (status: string) => {
  const s = status.toLowerCase();

  if (
    s === 'in progress' ||
    s === 'waiting_for_confirmation' ||
    s === 'assigned' ||
    s === 'declined'
  ) {
    return 'in progress';
  }

  if (s === 'closed') return 'closed';
  if (s === 'open') return 'open';

  return 'open'; // safe fallback
};


export default function Tickets() {
  const [activeTab, setActiveTab] = useState<'completed' | 'onprogress'>('onprogress');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('currentUser');
      if (!userStr) {
        console.log('No user found');
        setTickets([]);
        return;
      }

      const user = JSON.parse(userStr);

      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', user.id)
      );

      const snapshot = await getDocs(q);
      const userTickets: Ticket[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        let formattedDate = 'N/A';
        if (data.createdAt) {
          try {
            const timestamp = data.createdAt.toDate();
            formattedDate = timestamp.toISOString().split('T')[0];
          } catch (e) {
            console.error('Error formatting date:', e);
          }
        }

        userTickets.push({
          id: doc.id,
          title: data.description
            ? (() => {
              const words = data.description.trim().split(/\s+/);
              return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : data.description;
             })()
            : "Service Request",
          date: formattedDate,
          status: normalizeStatus(data.status || 'open'),
        });
      });

      userTickets.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      setTickets(userTickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTickets();
    }, [])
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => 
      (t.status === 'closed' ? 'completed' : 'onprogress') === activeTab
    );
  }, [activeTab, tickets]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 40, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <Text style={styles.header}>Raised Tickets</Text>
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
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onView={(id) => router.push(`/(tabs)/Tickets/${id}`)}
          />
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