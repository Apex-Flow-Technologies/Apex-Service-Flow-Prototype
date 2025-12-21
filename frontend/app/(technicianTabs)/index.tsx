import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
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
  orderBy,
  limit,
} from 'firebase/firestore';

/* ---------------- TYPES ---------------- */

interface Ticket {
  id: string;
  ticketId: number;
  description: string;
  status: string;
  createdAt?: any;
}

/* ---------------- HELPERS ---------------- */

const formatTicketId = (num?: number) =>
  num ? `#${String(num).padStart(4, '0')}` : '#0000';

const getStatusStyles = (status: string) => {
  if (status === 'assigned') {
    return {
      text: styles.statusAssigned,
      icon: 'alert-circle-outline',
      color: '#F57C00',
      label: 'New Task',
    };
  }

  if (status === 'waiting_for_confirmation') {
    return {
      text: styles.statusResolved,
      icon: 'hourglass-outline',
      color: '#43A047',
      label: 'Pending Approval',
    };
  }

  // Anything else should NOT be shown on this page
  return null;
};


/* ---------------- COMPONENT ---------------- */

export default function TechnicianHomeScreen() {
  const router = useRouter();

  const [isAvailable, setIsAvailable] = useState(true); 
  const [loading, setLoading] = useState(true);

  const [assignedCount, setAssignedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [technicianName, setTechnicianName] = useState('Technician');

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    let unsubscribe: any;

    const setupListener = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      setTechnicianName(user.name || user.username);

      const q = query(
        collection(db, 'tickets'),
        where('assignedToId', '==', user.username),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        let assigned = 0;
        let active = 0;
        let review = 0;
        const list: Ticket[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const status = (data.status || '').toLowerCase();

          if (status === 'assigned') assigned++;
          else if (status === 'in progress') active++;
          else if (status === 'waiting_for_confirmation') review++;

          if (list.length < 3) {
            list.push({
              id: docSnap.id,
              ticketId: data.ticketId,
              description: data.description || 'No description',
              status,
              createdAt: data.createdAt,
            });
          }
        });

        setAssignedCount(assigned);
        setActiveCount(active);
        setReviewCount(review);
        setRecentTickets(list);
        setLoading(false);
      });
    };

    setupListener();
    return () => unsubscribe && unsubscribe();
  }, []);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading tasks...</Text>
      </View>
    );
  }

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
            <View style={styles.profilePicWrapper}>
              <View style={styles.profilePic}>
                <Text style={styles.avatarText}>
                  {technicianName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: isAvailable ? '#43A047' : '#B0BEC5' }]} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Hello, {technicianName}</Text>
              <Text style={styles.memberSince}>Technician Portal</Text>
            </View>

            {/* Toggle untouched */}
            <View style={styles.availabilityWrapper}>
              <Text style={styles.availabilityText}>{isAvailable ? 'On Duty' : 'Off Duty'}</Text>
              <Switch
                value={isAvailable}
                onValueChange={() => setIsAvailable(v => !v)}
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={[styles.statCard, styles.statCardAssigned]}>
              <Ionicons name="clipboard-outline" size={20} color="#E65100" />
              <Text style={styles.statNumber}>{assignedCount}</Text>
              <Text style={styles.statLabel}>Assigned</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statCard, styles.statCardProgress]}>
              <Ionicons name="construct-outline" size={20} color="#1565C0" />
              <Text style={styles.statNumber}>{activeCount}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statCard, styles.statCardCompleted]}>
              <Ionicons name="hourglass-outline" size={20} color="#2E7D32" />
              <Text style={styles.statNumber}>{reviewCount}</Text>
              <Text style={styles.statLabel}>Reviewing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Work actions untouched */}
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
              onPress={() => router.push('/(technicianTabs)/CompletedJobs')}
            >
              <Ionicons name="time-outline" size={22} color="#2E86DE" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent tickets */}
        <View style={styles.ticketsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/(technicianTabs)/AssingedTickets')}>
              <Text style={styles.viewAllText}>View Tickets →</Text>
            </TouchableOpacity>
          </View>
           

          {recentTickets.map((t) => {
            const s = getStatusStyles(t.status);

            // 🚫 Skip tickets that are not assigned / waiting_for_confirmation
            if (!s) return null;

            return (
              <View key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketId}>
                    Ticket ID {formatTicketId(t.ticketId)}
                  </Text>
                  <Text style={s.text}>{s.label}</Text>
                </View>

                <Text style={styles.ticketSubject}>{t.description}</Text>

                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={14} color="#757575" />
                  <Text style={styles.locationText}>xxxx</Text>
                </View>
                <View style={styles.ticketCardFooter}>
                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={() =>
                      router.push({
                        pathname: '/ticket-detail/[id]',
                        params: { id: t.id }, // Firestore doc id
                      })
                    }
                  >
                    <Text style={styles.openButtonText}>Open Ticket</Text>
                    <Ionicons name="arrow-forward" size={14} color="#2E86DE" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

        </View>

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
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 20 },
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