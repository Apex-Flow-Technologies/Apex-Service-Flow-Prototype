import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/* ---------------- TYPES ---------------- */

interface Technician {
  username: string;        // UNIQUE ID
  name: string;
  specialty: string;
  activeTickets: number;
}

/* ---------------- COLOR UTILS ---------------- */

// Stable color from username (same user → same color)
const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// ✅ FIX 1: Added safety check for undefined username
const getColorFromUsername = (username: string | null | undefined) => {
  if (!username) return '#CCCCCC'; // Default grey if no username

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitial = (name: string) =>
  name?.charAt(0).toUpperCase() || '?';

/* ---------------- SCREEN ---------------- */

export default function TechniciansScreen() {
  const router = useRouter();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch technicians
        const usersSnap = await getDocs(collection(db, 'user'));
        
        const techs = usersSnap.docs
          .map(doc => doc.data())
          // ✅ FIX 2: Filter out users without a username to prevent crashes
          .filter(u => u.role === 'technician' && u.username) 
          .map(u => ({
            username: u.username,
            name: u.name || 'Unknown Technician', // Fallback name
            specialty: u.specialty ?? 'General',
            activeTickets: 0,
          }));

        // 2️⃣ Fetch tickets ONCE
        const ticketsSnap = await getDocs(collection(db, 'tickets'));
        const activeTickets = ticketsSnap.docs
          .map(doc => doc.data())
          .filter(
            t =>
              t.assignedToId &&
              (t.status === 'in progress' ||
                t.status === 'waiting_for_confirmation')
          );

        // 3️⃣ Count active tickets per technician
        const withCounts = techs.map(tech => ({
          ...tech,
          activeTickets: activeTickets.filter(
            t => t.assignedToId === tech.username
          ).length,
        }));

        setTechnicians(withCounts);
      } catch (err) {
        console.error('Failed to load technicians', err);
      }
    };

    fetchData();
  }, []);

  /* ---------------- SEARCH ---------------- */

  const filteredTechnicians = useMemo(() => {
    if (!searchQuery) return technicians;

    const q = searchQuery.toLowerCase();
    // ✅ FIX 3: Safety checks inside filter
    return technicians.filter(
      tech =>
        (tech.name || '').toLowerCase().includes(q) ||
        (tech.specialty || '').toLowerCase().includes(q)
    );
  }, [searchQuery, technicians]);

  /* ---------------- ADD / REMOVE (UI ONLY) ---------------- */

  const handleAddTechnician = () => {
    if (!newName || !newSpecialty) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    Alert.alert(
      'Info',
      'This screen is now read-only.\nTechnicians are managed from Firestore.'
    );

    setModalVisible(false);
    setNewName('');
    setNewSpecialty('');
  };

  const handleRemoveTechnician = (tech: Technician) => {
    Alert.alert(
      'Remove Technician',
      `Are you sure you want to remove ${tech.name}?`,
      [{ text: 'OK' }]
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Manage Technicians</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#2E86DE" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color="#8A8A8A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {filteredTechnicians.map(tech => {
          // This function is now safe to call even if username is weird
          const bgColor = getColorFromUsername(tech.username);

          return (
            <TouchableOpacity
              key={tech.username}
              style={styles.techCard}
              onPress={() =>
                router.push({
                  pathname: '/(managerTabs)/Technician',
                  params: { id: tech.username },
                })
              }
              onLongPress={() => handleRemoveTechnician(tech)}
            >
              {/* -------- LETTER AVATAR -------- */}
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: bgColor },
                ]}
              >
                <Text style={styles.avatarText}>
                  {getInitial(tech.name)}
                </Text>
              </View>

              <View style={styles.techInfo}>
                <Text style={styles.techName}>{tech.name}</Text>
                <Text style={styles.techSpecialty}>{tech.specialty}</Text>
              </View>

              <View style={styles.workloadContainer}>
                <Text style={styles.workloadNumber}>
                  {tech.activeTickets}
                </Text>
                <Text style={styles.workloadLabel}>Active</Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="#B0B0B0"
              />
            </TouchableOpacity>
          );
        })}

        {filteredTechnicians.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No technicians found.</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* -------- MODAL (UNCHANGED UI) -------- */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Technician</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Specialty"
              value={newSpecialty}
              onChangeText={setNewSpecialty}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleAddTechnician}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8ECF5' },

  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  addButton: { position: 'absolute', right: 18, top: 50 },

  container: { flex: 1 },
  content: { padding: 18 },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, height: 48 },

  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  techInfo: { flex: 1 },
  techName: { fontSize: 16, fontWeight: '600' },
  techSpecialty: { fontSize: 13, color: '#8A8A8A' },

  workloadContainer: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
  },
  workloadNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E86DE',
  },
  workloadLabel: { fontSize: 10, color: '#1976D2' },

  emptyContainer: { marginTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#8A8A8A' },

  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },

  modalInput: {
    height: 50,
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  modalButtonRow: { flexDirection: 'row' },
  modalButton: { flex: 1, paddingVertical: 14, marginHorizontal: 5 },
  modalButtonCancel: { backgroundColor: '#F0F4F8' },
  modalButtonSave: { backgroundColor: '#2E86DE' },
  modalButtonTextCancel: {
    color: '#2E86DE',
    textAlign: 'center',
    fontWeight: '700',
  },
  modalButtonTextSave: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: 18,
  },
});