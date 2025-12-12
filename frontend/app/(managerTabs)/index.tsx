import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView,  ActivityIndicator, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, doc, getDoc, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Static demo content for the Manager
const managerProfileImage = 'https://randomuser.me/api/portraits/men/75.jpg';

const RECENT_LIMIT = 2;

export default function ManagerHomeScreen() {
  const router = useRouter();

  // counts
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [inProgressCount, setInProgressCount] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  // recent open tickets list
  const [recentOpenTickets, setRecentOpenTickets] = useState<any[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    let countsUnsub: (() => void) | null = null;
    let recentUnsub: (() => void) | null = null;

    const start = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;
      // treat as manager if role/type indicates so
      const isManager =
        user && (user.role === 'manager' || user.isManager === true || user.type === 'manager');

      //
      // 1) Try reading counts from metadata/ticketCounter (if you keep counts there)
      //    If metadata doc doesn't have precomputed counts, fallback to counting tickets collection.
      //
      try {
        const metaRef = doc(db, 'metadata', 'ticketCounter');
        const metaSnap = await getDoc(metaRef);
        if (metaSnap.exists()) {
          const m = metaSnap.data();
          // Expect fields like openCount, inProgressCount, closedCount (change keys if you used different)
          if (
            typeof m.openCount === 'number' ||
            typeof m.inProgressCount === 'number' ||
            typeof m.closedCount === 'number'
          ) {
            setOpenCount(typeof m.openCount === 'number' ? m.openCount : 0);
            setInProgressCount(typeof m.inProgressCount === 'number' ? m.inProgressCount : 0);
            setCompletedCount(typeof m.closedCount === 'number' ? m.closedCount : 0);
            setLoadingCounts(false);
          } else {
            // metadata exists but doesn't have counts -> fallback to live counting
            subscribeCountsFromTickets();
          }
        } else {
          // metadata doc not present -> fallback to live counting
          subscribeCountsFromTickets();
        }
      } catch (err) {
        console.warn('metadata read failed, falling back to live counts', err);
        subscribeCountsFromTickets();
      }

      //
      // 2) Subscribe to recent open tickets (for manager show all open tickets, else only user's open)
      //
      try {
        const ticketsCol = collection(db, 'tickets');
        let q;
        if (isManager) {
          q = query(ticketsCol, where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(RECENT_LIMIT));
        } else {
          if (!user) {
            setRecentOpenTickets([]);
            setLoadingRecent(false);
            return;
          }
          q = query(
            ticketsCol,
            where('userId', '==', user.id),
            where('status', '==', 'open'),
            orderBy('createdAt', 'desc'),
            limit(RECENT_LIMIT)
          );
        }

        recentUnsub = onSnapshot(
          q,
          (snap) => {
            const list = snap.docs.map((d) => {
              const data = d.data() as any;
              // format ticketId: if numeric ticketId present use TCK-<num>, else derive short id
              const ticketId = data.ticketId ? `TCK-${data.ticketId}` : `#${d.id.slice(0, 6)}`;
              // get userName
              const userName = data.userName || data.customer || 'Unknown';
              // format date (YYYY-MM-DD) if Firestore timestamp present
              let date = 'N/A';
              if (data.createdAt?.toDate) {
                try {
                  date = data.createdAt.toDate().toISOString().split('T')[0];
                } catch {
                  date = String(data.createdAt);
                }
              } else if (data.createdAt) {
                date = String(data.createdAt);
              }
              // description: first 3 words
              const descRaw = (data.description || '').trim();
              let shortDesc = descRaw;
              if (descRaw) {
                const words = descRaw.split(/\s+/);
                shortDesc = words.length > 3 ? words.slice(0, 3).join(' ') + '...' : descRaw;
              } else {
                shortDesc = 'No details provided';
              }
              return {
                id: d.id,
                ticketId,
                userName,
                description: shortDesc,
                status: data.status || 'open',
                date,
                raw: data,
              };
            });

            setRecentOpenTickets(list);
            setLoadingRecent(false);
          },
          (err) => {
            console.error('recent open tickets onSnapshot error', err);
            setLoadingRecent(false);
          }
        );
      } catch (err) {
        console.error('subscribe recent open tickets failed', err);
        setLoadingRecent(false);
      }

      // helper fallback - subscribe to counts by scanning tickets collection live
      function subscribeCountsFromTickets() {
        try {
          const ticketsCol = collection(db, 'tickets');
          let q;
          if (isManager) {
            q = query(ticketsCol);
          } else {
            if (!user) {
              setOpenCount(0);
              setInProgressCount(0);
              setCompletedCount(0);
              setLoadingCounts(false);
              return;
            }
            q = query(ticketsCol, where('userId', '==', user.id));
          }

          countsUnsub = onSnapshot(
            q,
            (snap) => {
              let open = 0,
                progress = 0,
                closed = 0;
              snap.forEach((doc) => {
                const d = doc.data() as any;
                const status = (d.status || '').toString().toLowerCase();
                if (status === 'open') open++;
                else if (status === 'in progress' || status === 'pending closure') progress++;
                else if (status === 'closed') closed++;
              });
              setOpenCount(open);
              setInProgressCount(progress);
              setCompletedCount(closed);
              setLoadingCounts(false);
            },
            (err) => {
              console.error('counts onSnapshot error', err);
              setLoadingCounts(false);
            }
          );
        } catch (err) {
          console.error('subscribeCountsFromTickets error', err);
          setLoadingCounts(false);
        }
      }
    };

    start();

    return () => {
      if (countsUnsub) countsUnsub();
      if (recentUnsub) recentUnsub();
    };
  }, []);

  // Show spinner until counts are ready (you can adjust)
  const countsReady = !loadingCounts && openCount !== null && inProgressCount !== null && completedCount !== null;

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

          {/* Stats Section - dynamic counts */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={[styles.statCard, styles.statCardOpen]}>
              <Ionicons name="folder-open-outline" size={20} color="#FFA000" />
              <Text style={styles.statNumber}>{countsReady ? openCount : '—'}</Text>
              <Text style={styles.statLabel}>New Tickets</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, styles.statCardProgress]}>
              <Ionicons name="sync-circle-outline" size={20} color="#1976D2" />
              <Text style={styles.statNumber}>{countsReady ? inProgressCount : '—'}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, styles.statCardCompleted]}>
              <Ionicons name="hourglass-outline" size={20} color="#388E3C" />
              <Text style={styles.statNumber}>{countsReady ? completedCount : '—'}</Text>
              <Text style={styles.statLabel}>Pending Closure</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions (unchanged UI) */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(managerTabs)/PendingTickets')}>
              <Ionicons name="person-add-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Assign Tickets</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => router.push('/(managerTabs)/Technician')}
            >
              <Ionicons name="people-outline" size={22} color="#2E86DE" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Manage Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Tickets (ONLY OPEN tickets) */}
        <View style={styles.ticketsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tickets</Text>
            <TouchableOpacity onPress={() => router.push('/(managerTabs)/PendingTickets')}>
              <Text style={styles.viewAllText}>All Tickets →</Text>
            </TouchableOpacity>
          </View>

          {/* Loading recent */}
          {loadingRecent ? (
            <ActivityIndicator size="small" color="#1e90ff" />
          ) : recentOpenTickets.length === 0 ? (
            <Text style={{ color: '#666' }}>No open tickets.</Text>
          ) : (
            recentOpenTickets.map((t) => (
              <View key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketId}>
                    {t.ticketId} (from {t.userName})
                  </Text>
                  <Ionicons name="alert-circle-outline" size={18} color="#d32f2f" />
                </View>

                <Text style={styles.ticketSubject}>{t.description}</Text>

                <View style={styles.ticketCardFooter}>
                  <Text style={styles.statusOpen}>Open</Text>
                  <Text style={styles.ticketDate}>{t.date}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* spacer for bottom tab */}
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
