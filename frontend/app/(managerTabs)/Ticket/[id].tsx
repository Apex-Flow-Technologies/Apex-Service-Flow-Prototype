import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAudioPlayer } from 'expo-audio';
import { db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Ticket } from '../data/tickets';
import { useTickets } from '../tickets-store';
import { fetchTechnicians, Technician } from '../data/technicians';

export const href = null;

/* ---------------- STATUS MAPS ---------------- */

const statusColor: Record<Ticket['status'] | 'declined', string> = {
  New: '#d32f2f',
  Assigned: '#7b1fa2',
  'In Progress': '#2E86DE',
  'Waiting for Confirmation': '#f59e0b',
  Closed: '#43A047',
  declined: '#D32F2F', // ✅ REQUIRED
};

const statusIcon: Record<Ticket['status'] | 'declined', string> = {
  New: 'alert-circle',
  Assigned: 'person-add',
  'In Progress': 'sync',
  'Waiting for Confirmation': 'time',
  Closed: 'checkmark-circle',
  declined: 'close-circle', // ✅ REQUIRED
};

/* ------------------------------------------------ */

export default function ManagerTicketDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { getTicket, assignTicket, confirmClosure } = useTickets();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<View>(null);

  type Attachment = { type: 'image' | 'video' | 'audio'; uri: string };
  const [customerAttachments, setCustomerAttachments] = useState<Attachment[]>([]);
  const [technicianAttachments, setTechnicianAttachments] = useState<Attachment[]>([]);

  const ticket = useMemo(
    () => (id ? getTicket(id) : undefined),
    [id, getTicket]
  );

  useEffect(() => {
    fetchTechnicians()
      .then(list => setTechnicians(list.filter(t => t?.name)))
      .catch(err => console.error(err));
  }, []);

  // Fetch attachments directly from Firestore for this ticket
  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const ref = doc(db, 'tickets', String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const data: any = snap.data();
        setCustomerAttachments(Array.isArray(data.attachments) ? data.attachments : []);
        setTechnicianAttachments(Array.isArray(data.technicianAttachments) ? data.technicianAttachments : []);
      } catch (e) {
        console.error('Failed to fetch attachments', e);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!ticket) {
      router.replace('/(managerTabs)/PendingTickets');
    }
  }, [ticket]);

  if (!ticket) return null;

  const isDeclined = ticket.status === 'declined';

  const handleAssign = () => {
    if (!selectedTechnician) {
      Alert.alert(
        'Technician Required',
        'Please select a technician to assign this ticket.'
      );
      return;
    }

    assignTicket(ticket.id, {
      username: selectedTechnician.username,
      name: selectedTechnician.name,
    });

    Alert.alert(
      'Success',
      `Ticket assigned to ${selectedTechnician.name}!`,
      [
        {
          text: 'OK',
          onPress: () =>
            router.replace('/(managerTabs)/PendingTickets?tab=Assigned'),
        },
      ]
    );
  };

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Closure',
      'Are you sure you want to confirm and close this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            confirmClosure(ticket.id);
            router.replace('/(managerTabs)/PendingTickets?tab=Closed');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.replace('/(managerTabs)/PendingTickets')}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#1e90ff" />
          </TouchableOpacity>
          <Text style={styles.header}>Ticket Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.ticketId}>{ticket.ticketId}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor[ticket.status] }]}>
              <Ionicons
                name={statusIcon[ticket.status] as any}
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.badgeText}>
                {ticket.status === 'Waiting for Confirmation' ? 'Waiting' : ticket.status}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{ticket.title}</Text>
          <View style={styles.separator} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{ticket.customer}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{ticket.date}</Text>
            </View>

            {ticket.technician && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {isDeclined ? 'Declined by Technician' : 'Technician'}
                </Text>
                <Text style={styles.infoValue}>{ticket.technician}</Text>
              </View>
            )}
          </View>

          {/* Inline Attachments within the main card */}
          {customerAttachments.length > 0 && (
            <>
              <View style={styles.separator} />
              <Text style={styles.attachHeader}>Customer Attachments</Text>
              <AttachmentGrid list={customerAttachments} />
            </>
          )}

          {ticket.status === 'Waiting for Confirmation' && technicianAttachments.length > 0 && (
            <>
              <View style={styles.separator} />
              <Text style={styles.attachHeader}>Technician Attachments</Text>
              <AttachmentGrid list={technicianAttachments} />
            </>
          )}
        </View>

        {(ticket.status === 'New' || isDeclined) && (
  <View style={styles.actionCard}>
    <View style={styles.actionCardHeader}>
      <Ionicons name="person-add-outline" size={24} color="#2E86DE" />
      <Text style={styles.actionCardTitle}>
        {isDeclined ? 'Reassign Technician' : 'Assign Technician'}
      </Text>
    </View>

    <Text style={styles.actionCardDescription}>
      {isDeclined
        ? 'Assign this ticket to another technician.'
        : 'Assign this ticket to a technician to begin work.'}
    </Text>
<View style={styles.dropdownWrapper} ref={dropdownRef}>
  <Pressable
    style={[
      styles.dropdownButton,
      dropdownOpen && styles.dropdownButtonOpen,
    ]}
    onPress={() => setDropdownOpen(!dropdownOpen)}
  >
    <View style={styles.dropdownButtonContent}>
      <Ionicons
        name="construct-outline"
        size={20}
        color={selectedTechnician ? '#212121' : '#8A8A8A'}
        style={styles.inputIcon}
      />
      <Text
        style={[
          styles.dropdownButtonText,
          !selectedTechnician && styles.dropdownButtonPlaceholder,
        ]}
      >
        {selectedTechnician
          ? selectedTechnician.name
          : 'Select a technician'}
      </Text>
    </View>

    <Ionicons
      name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
      size={20}
      color="#8A8A8A"
    />
  </Pressable>

  {dropdownOpen && (
    <View style={styles.dropdownList}>
      <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        {technicians.map(item => (
          <TouchableOpacity
            key={item.username}
            style={[
              styles.dropdownItem,
              selectedTechnician?.username === item.username &&
                styles.dropdownItemSelected,
            ]}
            onPress={() => {
              setSelectedTechnician(item);
              setDropdownOpen(false);
            }}
          >
            <Text style={styles.dropdownItemName}>{item.name}</Text>

            {selectedTechnician?.username === item.username && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#2E86DE"
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )}
</View>


            <TouchableOpacity style={styles.primaryButton} onPress={handleAssign}>
              <Text style={styles.primaryButtonText}>
                {isDeclined ? 'Reassign Ticket' : 'Assign Ticket'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {ticket.status === 'Waiting for Confirmation' && (
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>
                Confirm & Close Ticket
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- ATTACHMENT GRID ---------------- */

function AttachmentGrid({ list }: { list: { type: 'image' | 'video' | 'audio'; uri: string }[] }) {
  return (
    <View style={styles.attachments}>
      {list.map((a, idx) => {
        if (a.type === 'image') {
          return (
            <Image key={`img-${idx}`} source={{ uri: a.uri }} style={styles.attachmentImg} contentFit="cover" />
          );
        }
        if (a.type === 'video') {
          return <VideoThumb key={`vid-${idx}`} uri={a.uri} />;
        }
        return (
          <View key={`aud-${idx}`} style={styles.audioPill}>
            <AudioRow uri={a.uri} />
          </View>
        );
      })}
    </View>
  );
}

function VideoThumb({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, p => (p.muted = true));
  return (
    <View style={styles.videoThumb}>
      <VideoView player={player} style={styles.videoThumb} contentFit="cover" />
      <View style={styles.playOverlay}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
    </View>
  );
}

function AudioRow({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  return (
    <TouchableOpacity style={styles.audioRow} onPress={() => (player.playing ? player.pause() : player.play())}>
      <Text style={styles.audioIcon}>{player.playing ? 'II' : '▶'}</Text>
      <Text style={styles.audioText}>Audio</Text>
    </TouchableOpacity>
  );
}

/* styles unchanged */


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
    gap: 10,
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
    marginLeft: 8,
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
  attachHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
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
  // Attachments
  attachments: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  attachmentImg: { width: 120, height: 80, borderRadius: 8 },
  videoThumb: { width: 120, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  playIcon: { color: '#fff', fontWeight: '800', fontSize: 18 },
  audioPill: { width: 160, height: 50, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center' },
  audioRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  audioIcon: { color: '#1e90ff', fontWeight: '800', fontSize: 16 },
  audioText: { color: '#222', fontWeight: '600' },
});
