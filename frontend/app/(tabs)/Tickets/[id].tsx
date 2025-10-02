import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTicketById, statusColor, Ticket } from '@/lib/mock/tickets';

// Hide this screen from the bottom tab bar
export const href = null;

// Enable swipe back gesture
export const unstable_settings = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  animationTypeForReplace: 'push',
};

export default function TicketDetails() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const ticket = Number.isFinite(id) ? getTicketById(id) : undefined;

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
        <Text style={styles.header}>Ticket #{ticket.id}</Text>
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
              {ticket.attachments.map((a, idx) => (
                <Image key={idx} source={{ uri: a.uri }} style={styles.attachmentImg} />
              ))}
            </View>
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
