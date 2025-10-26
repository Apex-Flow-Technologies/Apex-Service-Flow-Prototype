import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import { db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Hide this screen from the bottom tab bar
export const href = null;

// Enable swipe back gesture
export const unstable_settings = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  animationTypeForReplace: 'push',
};

// Status color mapping
const statusColor: Record<string, string> = {
  open: '#4CAF50',
  'in progress': '#2196F3',
  closed: '#9E9E9E',
};

interface Attachment {
  type: 'image' | 'video' | 'audio';
  uri: string;
  durationMs?: number;
}

interface Ticket {
  id: number | string;
  title?: string;
  date: string;
  machineCode: string;
  model: string;
  category: string;
  description: string;
  status: 'open' | 'in progress' | 'closed';
  attachments?: Attachment[];
}

export default function TicketDetails() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const ticketId = params.id;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<{ type: 'image' | 'video'; uri: string } | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ticketRef = doc(db, 'tickets', ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (ticketSnap.exists()) {
          const data = ticketSnap.data();
          
          // Format the date
          let formattedDate = 'N/A';
          if (data.createdAt) {
            try {
              const timestamp = data.createdAt.toDate();
              formattedDate = timestamp.toISOString().split('T')[0];
            } catch (e) {
              console.error('Error formatting date:', e);
            }
          }

          setTicket({
            id: ticketSnap.id,
            title: data.description?.substring(0, 50) || 'Service Request',
            date: formattedDate,
            machineCode: data.machineCode || 'N/A',
            model: data.model || 'N/A',
            category: data.category || 'N/A',
            description: data.description || 'No description provided',
            status: data.status || 'open',
            attachments: data.attachments || [],
          });
        } else {
          setTicket(null);
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={{ fontSize: 14, color: '#666', marginTop: 12 }}>Loading ticket...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#555' }}>Ticket not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.primaryBtn, { marginTop: 16 }]}>
          <Text style={styles.primaryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Ticket #{typeof ticket.id === 'string' ? ticket.id.substring(0, 8) : ticket.id}</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: statusColor[ticket.status] }]}>
          <Text style={styles.badgeText}>{ticket.status}</Text>
        </View>
        <Text style={styles.title}>{ticket.title}</Text>
        <Text style={styles.muted}>Date: {ticket.date}</Text>
        <View style={styles.separator} />
        <InfoRow label="Machine Code" value={ticket.machineCode} />
        <InfoRow label="Model" value={ticket.model} />
        <InfoRow label="Category" value={ticket.category} />
        <View style={styles.separator} />
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{ticket.description}</Text>
        {ticket.attachments?.length ? (
          <>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Attachments</Text>
            <View style={styles.attachments}>
              {ticket.attachments.map((a, idx) => {
                if (a.type === 'image') {
                  return (
                    <Pressable key={idx} onPress={() => { setViewerMedia({ type: 'image', uri: a.uri }); setViewerVisible(true); }}>
                      <Image source={{ uri: a.uri }} style={styles.attachmentImg} contentFit="cover" />
                    </Pressable>
                  );
                }
                if (a.type === 'video') {
                  return (
                    <VideoThumbnail key={idx} uri={a.uri} onPress={() => { setViewerMedia({ type: 'video', uri: a.uri }); setViewerVisible(true); }} />
                  );
                }
                return (
                  <View key={idx} style={styles.audioPill}>
                    <AudioPlayer uri={a.uri} />
                  </View>
                );
              })}
            </View>
            <MediaViewer visible={viewerVisible} media={viewerMedia} onClose={() => setViewerVisible(false)} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECF5',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
    paddingLeft: 0,
  },
  backBtnText: {
    color: '#1e90ff',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },
  muted: {
    color: '#666',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  body: {
    color: '#333',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    color: '#222',
    fontWeight: '700',
  },
  attachments: {
    flexDirection: 'row',
    gap: 8 as unknown as number,
    flexWrap: 'wrap',
  },
  attachmentImg: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  videoThumb: {
    width: 120,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  playOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPill: {
    width: 160,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#1e90ff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

function MediaViewer({ visible, media, onClose }: { visible: boolean; media: { type: 'image' | 'video'; uri: string } | null; onClose: () => void }) {
  const videoPlayer = useVideoPlayer(media?.type === 'video' ? media.uri : '', player => {
    player.muted = false;
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={viewerStyles.backdrop}>
        <Pressable style={viewerStyles.backdropFill} onPress={onClose} />
        <View style={viewerStyles.centered}>
          <View style={viewerStyles.content}>
            {media?.type === 'image' ? (
              <Image source={{ uri: media.uri }} style={viewerStyles.image} contentFit="contain" />
            ) : media?.type === 'video' ? (
              <VideoView player={videoPlayer} style={viewerStyles.video} nativeControls contentFit="contain" />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const viewerStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  backdropFill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { width: '92%', height: '70%', borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  video: { width: '100%', height: '100%', backgroundColor: '#000' },
});

function VideoThumbnail({ uri, onPress }: { uri: string; onPress: () => void }) {
  const player = useVideoPlayer(uri, player => {
    player.muted = true;
  });

  return (
    <Pressable onPress={onPress}>
      <View style={styles.videoThumb}>
        <VideoView
          player={player}
          style={styles.videoThumb}
          contentFit="cover"
          nativeControls={false}
        />
        <View style={styles.playOverlay}>
          <View style={styles.playCircle}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>▶</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function AudioPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);

  const toggle = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 }}>
      <TouchableOpacity onPress={toggle} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e90ff', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '800' }}>{player.playing ? 'II' : '▶'}</Text>
      </TouchableOpacity>
      <Text style={{ color: '#222', fontWeight: '600' }} numberOfLines={1} ellipsizeMode="tail">Audio</Text>
    </View>
  );
}