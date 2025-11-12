import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 1. DEFINE THE TECHNICIAN TYPE
interface Technician {
  id: string;
  name: string;
  image: string;
  activeTickets: number;
  specialty: string;
}

// 2. APPLY THE TYPE TO THE INITIAL DATA
const INITIAL_TECHNICIANS: Technician[] = [ // Note the: Technician[]
  {
    id: 'tech1',
    name: 'Alice Smith',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    activeTickets: 3,
    specialty: 'Hardware & Printers',
  },
  {
    id: 'tech2',
    name: 'Bob Johnson',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    activeTickets: 5,
    specialty: 'Network & Servers',
  },
  {
    id: 'tech3',
    name: 'Charlie Lee',
    image: 'https://randomuser.me/api/portraits/men/68.jpg',
    activeTickets: 1,
    specialty: 'Software & Accounts',
  },
  {
    id: 'tech4',
    name: 'David Kim',
    image: 'https://randomuser.me/api/portraits/men/70.jpg',
    activeTickets: 0,
    specialty: 'Mobile Devices',
  },
];

export default function TechniciansScreen() {
  const router = useRouter();
  
  // 3. APPLY THE TYPE TO THE STATE
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS); // Note the <Technician[]>
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  const filteredTechnicians = useMemo(() => {
    const sourceList = technicians; 

    if (!searchQuery) {
      return sourceList;
    }
    return sourceList.filter(
      (tech) =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, technicians]); 

  const handleAddTechnician = () => {
    if (!newName || !newSpecialty) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    // TypeScript knows this must be a Technician
    const newTech: Technician = { 
      id: `tech${Math.floor(Math.random() * 1000)}`,
      name: newName,
      specialty: newSpecialty,
      image: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 80)}.jpg`,
      activeTickets: 0,
    };

    setTechnicians([...technicians, newTech]);
    setModalVisible(false);
    setNewName('');
    setNewSpecialty('');
  };

  // 4. THIS IS THE FIX FROM YOUR SCREENSHOT
  // We tell the function that `tech` is of type `Technician`
  const handleRemoveTechnician = (tech: Technician) => { 
    Alert.alert(
      'Remove Technician',
      `Are you sure you want to remove ${tech.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setTechnicians(technicians.filter(t => t.id !== tech.id));
          },
          style: 'destructive',
        },
      ]
    );
  };
  
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
            <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or specialty..."
              placeholderTextColor="#8A8A8A"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {filteredTechnicians.map(tech => ( // tech is automatically typed as `Technician` here
          <TouchableOpacity
            key={tech.id}
            style={styles.techCard}
            onPress={() => router.push({ pathname: '/(managerTabs)/Technician', params: { id: tech.id } })}
            onLongPress={() => handleRemoveTechnician(tech)} // This now works
          >
            <Image source={{ uri: tech.image }} style={styles.profilePic} />
            <View style={styles.techInfo}>
              <Text style={styles.techName}>{tech.name}</Text>
              <Text style={styles.techSpecialty}>{tech.specialty}</Text>
            </View>
            <View style={styles.workloadContainer}>
              <Text style={styles.workloadNumber}>{tech.activeTickets}</Text>
              <Text style={styles.workloadLabel}>Active</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={22} color="#B0B0B0" />
          </TouchableOpacity>
        ))}

        {filteredTechnicians.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No technicians found.</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Technician</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              placeholderTextColor="#8A8A8A"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Specialty (e.g., Hardware)"
              placeholderTextColor="#8A8A8A"
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8ECF5',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    right: 18,
    top: 50,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
  },
  searchContainer: {
    marginBottom: 18,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#212121',
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  techInfo: {
    flex: 1,
    marginRight: 10,
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  techSpecialty: {
    fontSize: 13,
    color: '#8A8A8A',
    marginTop: 3,
  },
  workloadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  workloadNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E86DE',
  },
  workloadLabel: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8A8A',
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    width: '90%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#212121',
  },
  modalInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#F0F4F8',
  },
  modalButtonSave: {
    backgroundColor: '#2E86DE',
  },
  modalButtonTextCancel: {
    color: '#2E86DE',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtonTextSave: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});