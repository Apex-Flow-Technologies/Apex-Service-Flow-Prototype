import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTickets } from './tickets-store';
import { Ticket } from './data/tickets';

const FILTER_TABS = ['New', 'In Progress', 'Closed'] as const;


const getStatusUI = (status: Ticket['status']) => {
  switch (status) {
    case 'New':
      return {
        label: 'open',
        icon: 'alert-circle-outline',
        color: '#d32f2f',
        textStyle: styles.statusNew,
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        icon: 'sync-circle-outline',
        color: '#2E86DE',
        textStyle: styles.statusInProgress,
      };
      case 'Waiting for Confirmation':
      return {
        label: 'Waiting for Confirmation',
        icon: 'sync-circle-outline',
        color: '#2E86DE',
        textStyle: styles.statusWaiting,
      };
    case 'Closed':
      return {
        label: 'Closed',
        icon: 'checkmark-circle-outline',
        color: '#43A047',
        textStyle: styles.statusClosed,
      };
    default:
      return {
        label: status,
        icon: 'help-circle-outline',
        color: '#999',
        textStyle: styles.statusClosed,
      };
  }
};


export default function PendingTickets() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { tickets } = useTickets();

  const [activeTab, setActiveTab] = useState<
    typeof FILTER_TABS[number]
  >(FILTER_TABS.includes(tab as any) ? (tab as any) : 'New');

  const [searchQuery, setSearchQuery] = useState('');


  const ticketsByTab = useMemo(() => {
    if (activeTab === 'New') {
      return tickets.filter(t => t.status === 'New');
    }
    if (activeTab === 'In Progress') {
      return tickets.filter(
        t =>
          t.status === 'In Progress' ||
          t.status === 'Waiting for Confirmation'
      );
    }
    if (activeTab === 'Closed') {
      return tickets.filter(t => t.status === 'Closed');
    }
    return tickets;
  }, [activeTab, tickets]);


  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return ticketsByTab;

    const q = searchQuery.toLowerCase();
    return ticketsByTab.filter(t =>
      `${t.ticketId} ${t.title} ${t.customer}`
        .toLowerCase()
        .includes(q)
    );
  }, [searchQuery, ticketsByTab]);

  const isLoading = tickets.length === 0;

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>All Tickets</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#8A8A8A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, title, or customer..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        {FILTER_TABS.map(tabItem => (
          <TouchableOpacity
            key={tabItem}
            style={[
              styles.filterTab,
              activeTab === tabItem && styles.filterTabActive,
            ]}
            onPress={() => setActiveTab(tabItem)}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === tabItem && styles.filterTextActive,
              ]}
            >
              {tabItem}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2E86DE" />
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tickets found</Text>
          </View>
        ) : (
          filteredTickets.map(ticket => {
            const statusUI = getStatusUI(ticket.status);
            

            return (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() =>
                  router.push(`/(managerTabs)/Ticket/${ticket.id}`)
                }
              >
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketId}>
                    {ticket.ticketId} (from {ticket.customer})
                  </Text>


                  <Ionicons
                    name={statusUI.icon as any}
                    size={18}
                    color={statusUI.color}
                  />
                </View>

                <Text style={styles.ticketSubject}>{ticket.title}</Text>

                {/* Technician name (In Progress & Closed) */}
                {ticket.technician && (
                  <View style={styles.techBadge}>
                    <Ionicons
                      name="construct-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.techName}>{ticket.technician}</Text>
                  </View>
                )}

                <View style={styles.ticketCardFooter}>
                  <Text style={statusUI.textStyle}>
                    {statusUI.label}
                  </Text>
                  <Text style={styles.ticketDate}>{ticket.date}</Text>
                </View>

              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

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

  searchContainer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    marginLeft: 8,
    color: '#212121',
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterTabActive: {
    backgroundColor: '#2E86DE',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#616161',
  },
  filterTextActive: {
    color: '#fff',
  },

  content: {
    padding: 18,
  },
  techBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  backgroundColor: '#F1F3F5',   // faint grey
  borderRadius: 14,
  paddingHorizontal: 10,
  paddingVertical: 4,
  marginBottom: 6,
},

techName: {
  marginLeft: 6,
  fontSize: 13,
  fontWeight: '600',
  color: '#6B7280',
},



  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 12,
    color: '#B0B0B0',
    fontWeight: '500',
  },

  statusNew: {
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

  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8A8A',
  },
});