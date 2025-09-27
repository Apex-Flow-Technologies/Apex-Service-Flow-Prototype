import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const userProfileImage = 'https://randomuser.me/api/portraits/women/68.jpg'; // Replace with your actual image

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.cardContainer}>
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

          <Text style={styles.sectionTitle}>Recent Tickets</Text>

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

          <TouchableOpacity style={styles.raiseTicketButton} onPress={() => router.push('/(tabs)/RaiseTicket')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.raiseTicketText}>Raise New Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Add space at the bottom for tab bar */}
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
    paddingTop: 60, // The value has been increased to 60 for more space
    paddingBottom: 0,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  profilePicWrapper: {
    position: 'relative',
    marginRight: 18,
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eaeaea',
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
    marginBottom: 14,
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