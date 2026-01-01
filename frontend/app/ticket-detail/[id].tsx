// Technician Ticket Detail Screen
// Shows ticket details based on Firestore ticket ID passed via route

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Image } from 'expo-image';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';

/* ---------------- TYPES ---------------- */
const statusLabel: Record<string, string> = {
  open: 'Open',
  assigned: 'Assigned',
  'in progress': 'In Progress',
  closed: 'Closed',
  waiting_for_confirmation: 'Pending approval',
  declined: 'Declined',
};
const statusColor: Record<string, string> = {
  open: '#4CAF50',
  assigned: '#2E86DE',
  'in progress': '#2196F3',
  closed: '#9E9E9E',
  waiting_for_confirmation: '#FFA500',
  declined: '#D32F2F',
}

interface Attachment {
  type: 'image' | 'video' | 'audio';
  uri: string;
}

interface Ticket {
  id: string;
  ticketId?: number;
  title: string;
  date: string;
  machineCode: string;
  description: string;
  attachments: Attachment[];
  status: 'assigned' | 'open' | 'in progress' | 'closed' | 'waiting_for_confirmation' | 'declined';
}

/* ---------------- SCREEN ---------------- */

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<{ type: 'image' | 'video'; uri: string } | null>(null);
  const [technicianAttachments, setTechnicianAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Actions for assigned tickets
  const handleAccept = async () => {
    if (!ticket) return;
    try {
      await updateDoc(doc(db, 'tickets', ticket.id), {
        status: 'in progress',
        startedAt: new Date(),
      });
      setTicket({ ...ticket, status: 'in progress' });
    } catch (e) {
      console.error('Failed to accept ticket', e);
    }
  };

  const handleDecline = async () => {
    if (!ticket) return;
    Alert.alert(
      'Decline Job',
      'Are you sure you want to decline this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'tickets', ticket.id), {
                status: 'declined',
                declinedAt: new Date(),
              });
              setTicket({ ...ticket, status: 'declined' });
              // Navigate back after declining
              router.back();
            } catch (e) {
              console.error('Failed to decline ticket', e);
              Alert.alert('Error', 'Failed to decline the ticket');
            }
          },
        },
      ]
    );
  };

  // Photo upload for technician
  const ensureMediaPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
      return false;
    }
    return true;
  };

  const handlePickPhoto = async () => {
    const ok = await ensureMediaPermissions();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setTechnicianAttachments((prev) => [
        ...prev,
        { type: 'image' as const, uri: asset.uri },
      ]);
    }
  };

  const handleCapturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setTechnicianAttachments((prev) => [
        ...prev,
        { type: 'image' as const, uri: asset.uri },
      ]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setTechnicianAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCompleteJob = async () => {
    if (!ticket) return;

    if (technicianAttachments.length === 0) {
      Alert.alert('Photo Required', 'Please upload at least one photo of the completed job.');
      return;
    }

    Alert.alert(
      'Complete Job',
      'Are you sure you want to submit this job for manager approval?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(true);
              await updateDoc(doc(db, 'tickets', ticket.id), {
                status: 'waiting_for_confirmation',
                completedAt: new Date(),
                technicianAttachments: technicianAttachments,
              });
              Alert.alert('Success', 'Job submitted for manager approval!', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (e) {
              console.error('Failed to complete job', e);
              Alert.alert('Error', 'Failed to submit the job. Please try again.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  /* ---------------- FETCH TICKET ---------------- */

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ref = doc(db, 'tickets', id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setTicket(null);
          return;
        }

        const data = snap.data();

        let formattedDate = 'N/A';
        if (data.createdAt?.toDate) {
          formattedDate = data.createdAt.toDate().toISOString().split('T')[0];
        }

        setTicket({
          id: snap.id,
          ticketId: data.ticketId,
          title: data.description
            ? data.description.substring(0, 50)
            : 'Service Request',
          date: formattedDate,
          machineCode: data.machineCode || 'N/A',
          description: data.description || 'No description provided',
          attachments: data.attachments || [],
          status: data.status || 'open',
        });

        // Load existing technician attachments if any
        if (data.technicianAttachments && Array.isArray(data.technicianAttachments)) {
          setTechnicianAttachments(data.technicianAttachments);
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Loading ticket...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.notFound}>Ticket not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
  style={styles.scroll}
  contentContainerStyle={styles.scrollContent}
>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.header}>
            Ticket #{String(ticket.ticketId ?? ticket.id).padStart(4, '0')}
          </Text>
        </View>
        
        {/* Card */}
        <View style={styles.card}>
            <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor[ticket.status] },
          ]}
        >
          <Text style={styles.statusText}>
            {statusLabel[ticket.status]}
          </Text>
        </View>

          <Text style={styles.title}>{ticket.title}</Text>
          <Text style={styles.muted}>Date: {ticket.date}</Text>

          <View style={styles.separator} />
          <InfoRow label="Machine Code" value={ticket.machineCode} />

          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{ticket.description}</Text>

          {/* Attachments */}
          {ticket.attachments.length > 0 && (
            <>
              <View style={styles.separator} />
              <Text style={styles.sectionTitle}>Attachments</Text>

              <View style={styles.attachments}>
                {ticket.attachments.map((a, idx) => {
                  if (a.type === 'image') {
                    return (
                      <Pressable
                        key={idx}
                        onPress={() => {
                          setViewerMedia({ type: 'image', uri: a.uri });
                          setViewerVisible(true);
                        }}
                      >
                        <Image source={{ uri: a.uri }} style={styles.attachmentImg} contentFit="cover" />
                      </Pressable>
                    );
                  }

                  if (a.type === 'video') {
                    return (
                      <VideoThumb
                        key={idx}
                        uri={a.uri}
                        onPress={() => {
                          setViewerMedia({ type: 'video', uri: a.uri });
                          setViewerVisible(true);
                        }}
                      />
                    );
                  }

                  return (
                    <View key={idx} style={styles.audioPill}>
                      <AudioPlayer uri={a.uri} />
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {ticket.status === 'assigned' && (
          <View style={styles.actionRowContainer}>
            <TouchableOpacity style={[styles.actionBtn, styles.btnDecline]} onPress={handleDecline}>
              <Ionicons name="close-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.btnAccept]} onPress={handleAccept}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Technician Container for In Progress Tickets */}
        {ticket.status === 'in progress' && (
          <View style={styles.technicianContainer}>
            <Text style={styles.technicianTitle}>Job Completion</Text>
            <Text style={styles.technicianSubtitle}>Upload photos of the completed work</Text>

            {/* Photo Upload Buttons */}
            <View style={styles.uploadButtonRow}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickPhoto}
              >
                <Ionicons name="image-outline" size={20} color="#2E86DE" />
                <Text style={styles.uploadButtonText}>Choose Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleCapturePhoto}
              >
                <Ionicons name="camera-outline" size={20} color="#2E86DE" />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Preview Uploaded Photos */}
            {technicianAttachments.length > 0 && (
              <View style={styles.technicianAttachments}>
                <Text style={styles.sectionTitle}>Uploaded Photos</Text>
                <View style={styles.attachments}>
                  {technicianAttachments.map((attachment, idx) => (
                    <View key={idx} style={styles.attachmentWrapper}>
                      <Pressable
                        onPress={() => {
                          setViewerMedia({ type: 'image', uri: attachment.uri });
                          setViewerVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: attachment.uri }}
                          style={styles.attachmentImg}
                          contentFit="cover"
                        />
                      </Pressable>
                      <TouchableOpacity
                        style={styles.removeAttachmentBtn}
                        onPress={() => handleRemoveAttachment(idx)}
                      >
                        <Ionicons name="close-circle" size={24} color="#D32F2F" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Done Button */}
            <TouchableOpacity
              style={[
                styles.doneButton,
                technicianAttachments.length > 0
                  ? styles.doneButtonActive
                  : styles.doneButtonDisabled,
              ]}
              onPress={handleCompleteJob}
              disabled={technicianAttachments.length === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.doneButtonText}>Done</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <MediaViewer
          visible={viewerVisible}
          media={viewerMedia}
          onClose={() => setViewerVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- COMPONENTS ---------------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MediaViewer({
  visible,
  media,
  onClose,
}: {
  visible: boolean;
  media: { type: 'image' | 'video'; uri: string } | null;
  onClose: () => void;
}) {
  const player = useVideoPlayer(media?.type === 'video' ? media.uri : '');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewerBackdrop}>
        <Pressable style={styles.viewerFill} onPress={onClose} />
        {media?.type === 'image' && (
          <Image source={{ uri: media.uri }} style={styles.viewerMedia} contentFit="contain" />
        )}
        {media?.type === 'video' && (
          <VideoView player={player} style={styles.viewerMedia} nativeControls contentFit="contain" />
        )}
      </View>
    </Modal>
  );
}

function VideoThumb({ uri, onPress }: { uri: string; onPress: () => void }) {
  const player = useVideoPlayer(uri, p => (p.muted = true));

  return (
    <Pressable onPress={onPress}>
      <View style={styles.videoThumb}>
        <VideoView player={player} style={styles.videoThumb} contentFit="cover" />
        <View style={styles.playOverlay}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>
    </Pressable>
  );
}

function AudioPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);

  return (
    <TouchableOpacity style={styles.audioRow} onPress={() => (player.playing ? player.pause() : player.play())}>
      <Text style={styles.audioIcon}>{player.playing ? 'II' : '▶'}</Text>
      <Text style={styles.audioText}>Audio</Text>
    </TouchableOpacity>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  
  safeArea: { flex: 1, backgroundColor: '#E8ECF5' },
  container: { flex: 1, padding: 16 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  notFound: { fontSize: 16, color: '#555', marginBottom: 12 },
  scroll: {
  flex: 1,
  backgroundColor: '#E8ECF5',
},

scrollContent: {
  paddingHorizontal: 16, // ✅ LEFT & RIGHT SPACE (MATCHES REFERENCE IMAGE)
  paddingBottom: 32,
},


  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 12 },
  backBtn: { paddingRight: 12 },
  backText: { color: '#1e90ff', fontWeight: '600' },
  header: { fontSize: 20, fontWeight: '800', color: '#222' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: '#222' },
  muted: { color: '#666', marginTop: 4 },

  separator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  body: { color: '#333', lineHeight: 20 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#666', fontWeight: '600' },
  infoValue: { color: '#222', fontWeight: '700' },

  attachments: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attachmentImg: { width: 120, height: 80, borderRadius: 8 },

  videoThumb: { width: 120, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  playIcon: { color: '#fff', fontWeight: '800', fontSize: 20 },

  audioPill: { width: 160, height: 50, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center' },
  audioRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  audioIcon: { color: '#1e90ff', fontWeight: '800', fontSize: 18 },
  audioText: { color: '#222', fontWeight: '600' },

  viewerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  viewerFill: { ...StyleSheet.absoluteFillObject },
  viewerMedia: { width: '90%', height: '70%' },

  primaryBtn: { backgroundColor: '#1e90ff', padding: 12, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  statusBadge: {
  alignSelf: 'flex-start',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 4,
  marginBottom: 8,
},

statusText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 12,
  textTransform: 'lowercase',
},

  actionRowContainer: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 20,
    paddingHorizontal: 0,
  },
  actionBtn: { 
    flex: 1, 
    height: 50, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnAccept: { backgroundColor: '#2E86DE' },
  btnDecline: { backgroundColor: '#D32F2F' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Technician Container Styles
  technicianContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  technicianTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  technicianSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  uploadButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  uploadButtonText: {
    color: '#2E86DE',
    fontWeight: '600',
    fontSize: 14,
  },
  technicianAttachments: {
    marginBottom: 16,
  },
  attachmentWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  removeAttachmentBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doneButtonActive: {
    backgroundColor: '#43A047',
  },
  doneButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

});
