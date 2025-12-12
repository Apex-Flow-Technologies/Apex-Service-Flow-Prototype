import React, { useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ticket } from '../data/tickets';
import { useTickets } from '../tickets-store';
import { INITIAL_TECHNICIANS, Technician } from '../data/technicians';

export const href = null;

const statusColor: Record<Ticket['status'], string> = {
  'New': '#d32f2f',
  'In Progress': '#2E86DE',
  'Waiting for Confirmation': '#f59e0b',
  'Closed': '#43A047',
};

const statusIcon: Record<Ticket['status'], string> = {
  'New': 'alert-circle',
  'In Progress': 'sync',
  'Waiting for Confirmation': 'time',
  'Closed': 'checkmark-circle',
};

export default function ManagerTicketDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { getTicket, assignTicket, confirmClosure } = useTickets();
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<View>(null);

  const ticket = useMemo(() => (id ? getTicket(id) : undefined), [id, getTicket]);
  
  // Reset selected technician when ticket status changes (e.g., after assignment)
  useEffect(() => {
    if (ticket?.status !== 'New') {
      setSelectedTechnician(null);
      setDropdownOpen(false);
    }
  }, [ticket?.status]);

  const handleBack = () => {
    router.replace('/(managerTabs)/PendingTickets');
  };

  const handleAssign = () => {
    console.log('handleAssign called, selectedTechnician:', selectedTechnician);
    if (!selectedTechnician) {
      Alert.alert('Technician Required', 'Please select a technician to assign this ticket.');
      return;
    }
    if (!ticket) {
      Alert.alert('Error', 'Ticket not found.');
      return;
    }
    
    console.log('Assigning ticket:', ticket.id, 'to technician:', selectedTechnician.name);
    
    // Assign ticket and update status to "In Progress"
    assignTicket(ticket.id, selectedTechnician.name);
    
    // Show success message and navigate to In Progress tab
    Alert.alert(
      'Success', 
      `Ticket assigned to ${selectedTechnician.name}!\n\nThe ticket has been moved to "In Progress".`, 
      [
        { 
          text: 'OK', 
          onPress: () => router.replace('/(managerTabs)/PendingTickets?tab=In Progress') 
        }
      ]
    );
  };

  const handleSelectTechnician = (tech: Technician) => {
    setSelectedTechnician(tech);
    setDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (!ticket) return;
    
    Alert.alert(
      'Confirm Closure',
      'Are you sure you want to confirm and close this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            confirmClosure(ticket.id);
            Alert.alert('Success', 'Ticket closed successfully!', [
              { text: 'OK', onPress: () => router.replace('/(managerTabs)/PendingTickets?tab=Closed') }
            ]);
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (!ticket) {
      handleBack();
    }
    return () => {
      // Component cleanup
    };
  }, [ticket]);


  if (!ticket) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        onScrollBeginDrag={() => dropdownOpen && setDropdownOpen(false)}
        scrollEventThrottle={16}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1e90ff" />
          </TouchableOpacity>
          <Text style={styles.header}>Ticket Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.ticketId}>{ticket.id}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor[ticket.status] }]}>
              <Ionicons name={statusIcon[ticket.status] as any} size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{ticket.status}</Text>
            </View>
          </View>

          <Text style={styles.title}>{ticket.title}</Text>

          <View style={styles.separator} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={18} color="#666" />
                <Text style={styles.infoLabel}>Customer</Text>
              </View>
              <Text style={styles.infoValue}>{ticket.customer}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.infoLabel}>Date</Text>
              </View>
              <Text style={styles.infoValue}>{ticket.date}</Text>
            </View>

            {ticket.technician && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="construct-outline" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Technician</Text>
                </View>
                <Text style={styles.infoValue}>{ticket.technician}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Cards based on status */}
        {ticket.status === 'New' && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="person-add-outline" size={24} color="#2E86DE" />
              <Text style={styles.actionCardTitle}>Assign Technician</Text>
            </View>
            <Text style={styles.actionCardDescription}>
              Assign this ticket to a technician to begin work.
            </Text>
            
            {/* Dropdown Container */}
            <View style={styles.dropdownWrapper} ref={dropdownRef}>
              <Pressable
                style={[styles.dropdownButton, dropdownOpen && styles.dropdownButtonOpen]}
                onPress={() => {
                  console.log('Dropdown button pressed, current state:', dropdownOpen);
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <View style={styles.dropdownButtonContent}>
                  <Ionicons name="construct-outline" size={20} color={selectedTechnician ? "#212121" : "#8A8A8A"} style={styles.inputIcon} />
                  <Text style={[styles.dropdownButtonText, !selectedTechnician && styles.dropdownButtonPlaceholder]}>
                    {selectedTechnician ? selectedTechnician.name : 'Select a technician'}
                  </Text>
                </View>
                <Ionicons 
                  name={dropdownOpen ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#8A8A8A" 
                />
              </Pressable>

              {/* Dropdown List */}
              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {INITIAL_TECHNICIANS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      style={[
                        styles.dropdownItem,
                        selectedTechnician?.id === item.id && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        console.log('Selecting technician:', item.name);
                        handleSelectTechnician(item);
                      }}
                    >
                      <Image source={{ uri: item.image }} style={styles.dropdownItemImage} />
                      <View style={styles.dropdownItemInfo}>
                        <Text style={styles.dropdownItemName}>{item.name}</Text>
                        <Text style={styles.dropdownItemSpecialty}>{item.specialty}</Text>
                      </View>
                      {selectedTechnician?.id === item.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#2E86DE" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleAssign}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Assign Ticket</Text>
            </TouchableOpacity>
          </View>
        )}

        {ticket.status === 'In Progress' && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={24} color="#2E86DE" />
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Ticket In Progress</Text>
              <Text style={styles.infoBannerText}>
                This ticket is currently being worked on by {ticket.technician || 'the assigned technician'}. 
                Please wait for the technician to mark it as completed.
              </Text>
            </View>
          </View>
        )}

        {ticket.status === 'Waiting for Confirmation' && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#f59e0b" />
              <Text style={styles.actionCardTitle}>Ready for Closure</Text>
            </View>
            <Text style={styles.actionCardDescription}>
              The technician has marked this ticket as completed. Please review and confirm closure.
            </Text>
            {ticket.technician && (
              <View style={styles.confirmationInfo}>
                <Ionicons name="construct-outline" size={18} color="#666" />
                <Text style={styles.confirmationInfoText}>
                  Completed by {ticket.technician}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm & Close Ticket</Text>
            </TouchableOpacity>
          </View>
        )}

        {ticket.status === 'Closed' && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#43A047" />
            <View style={styles.infoBannerContent}>
              <Text style={styles.successBannerTitle}>Ticket Closed</Text>
              <Text style={styles.successBannerText}>
                This ticket has been successfully closed.
              </Text>
            </View>
          </View>
        )}
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
  contentContainer: {
    padding: 18,
    paddingTop: 50,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 12,
    paddingLeft: 0,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#363636',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 16,
    lineHeight: 28,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  infoValue: {
    color: '#212121',
    fontWeight: '700',
    fontSize: 15,
  },
  // Action Card Styles
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  actionCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 18,
  },
  // Dropdown Styles
  dropdownWrapper: {
    position: 'relative',
    marginBottom: 18,
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownButtonOpen: {
    borderColor: '#2E86DE',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
  },
  dropdownButtonPlaceholder: {
    color: '#8A8A8A',
    fontWeight: '400',
  },
  dropdownList: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 250,
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  dropdownItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  dropdownItemInfo: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  dropdownItemSpecialty: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  inputIcon: {
    marginRight: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86DE',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#2E86DE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    gap: 8,
  },
  confirmationInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  // Info Banner Styles
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E86DE',
    marginBottom: 6,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  successBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  successBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#43A047',
    marginBottom: 6,
  },
  successBannerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
