import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Home screen uses static demo content
const userProfileImage = 'https://randomuser.me/api/portraits/women/68.jpg';

export default function HomeScreen() {
  const router = useRouter();
  
  const [openCount, setOpenCount] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTicketCounts = async () => {
    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const q = query(collection(db, 'tickets'), where('userId', '==', user.id));

      // 🔥 Real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let open = 0, progress = 0, closed = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const status = (data.status || '').toLowerCase();
          if (status === 'open') open++;
          else if (status === 'in progress') progress++;
          else if (status === 'closed') closed++;
        });

        setOpenCount(open);
        setProgressCount(progress);
        setCompletedCount(closed);
        setLoading(false);
      });

      // cleanup listener when screen unmounts
      return () => unsubscribe();
    } catch (err) {
      console.log('Error setting up ticket listener:', err);
      setLoading(false);
    }
  };

  fetchTicketCounts();
}, []);


  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={{ color: '#666', marginTop: 10 }}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Container */}
        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
            <View style={styles.profilePicWrapper}>
              <Image source={{ uri: userProfileImage }} style={styles.profilePic} />
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={20} color="#2E86DE" />
              </View>
            </View>
            <View>
              <Text style={styles.userName}>Hello, Jane Doe</Text>
              <Text style={styles.memberSince}>Member since 2022</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={[styles.statCard, styles.statCardOpen]}>
              <Ionicons name="folder-open-outline" size={20} color="#FFA000" />
              <Text style={styles.statNumber}>{openCount}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, styles.statCardProgress]}>
              <Ionicons name="sync-circle-outline" size={20} color="#1976D2" />
              <Text style={styles.statNumber}>{progressCount}</Text>
              <Text style={styles.statLabel}>On Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, styles.statCardCompleted]}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color="#388E3C" />
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tickets Container */}
        <View style={styles.ticketsContainer}>
          {/* Section header with "All Tickets" button */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tickets</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/Tickets')}>
              <Text style={styles.viewAllText}>All Tickets →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ticketCard}>
            <View style={styles.ticketCardHeader}>
              <Text style={styles.ticketId}>Ticket ID: #123456</Text>
              <Ionicons name="create-outline" size={18} color="#6C63FF" />
            </View>
            <Text style={styles.ticketSubject}>Issue with Laptop Battery</Text>
            <View style={styles.ticketCardFooter}>
              <Text style={styles.statusInProgress}>In Progress</Text>
              <Text style={styles.ticketDate}>2024-03-08</Text>
            </View>
          </View>

          <View style={styles.ticketCard}>
            <View style={styles.ticketCardHeader}>
              <Text style={styles.ticketId}>Ticket ID: #123455</Text>
              <Ionicons name="checkmark-circle" size={18} color="#43A047" />
            </View>
            <Text style={styles.ticketSubject}>Query about Warranty</Text>
            <View style={styles.ticketCardFooter}>
              <Text style={styles.statusClosed}>Closed</Text>
              <Text style={styles.ticketDate}>2024-03-01</Text>
            </View>
          </View>
        </View>

        {/* Raise Ticket Button */}
        <TouchableOpacity style={styles.raiseTicketButton} onPress={() => router.push('/(tabs)/RaiseTicket')}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.raiseTicketText}>Raise New Ticket</Text>
        </TouchableOpacity>

        {/* Spacer for tab bar */}
        <View style={{ height: 60 }} />
      </ScrollView>
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
    fontSize: 15,
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
  raiseTicketButton: {
    flexDirection: 'row',
    backgroundColor: '#2E86DE',
    borderRadius: 20,
    paddingVertical: 15,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  raiseTicketText: {
    color: '#fff',
    fontWeight: '700',  
    fontSize: 16,
    marginLeft: 8,
  },
});
