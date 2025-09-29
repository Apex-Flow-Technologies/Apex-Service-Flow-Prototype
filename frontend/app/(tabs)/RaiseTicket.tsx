import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Toast from 'react-native-root-toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tickets as MOCK_TICKETS, Ticket } from '@/lib/mock/tickets';

export default function RaiseTicket() {
  const [machineCode, setMachineCode] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();
  const recentTickets = useMemo(() => MOCK_TICKETS.slice(0, 3), []);

  const handleUpload = () => {
    // TODO: Integrate media picker
  };

  const handleAudio = () => {
    // TODO: Integrate audio recorder
  };


  const showSuccessToast = () => {
    Toast.show('Request submitted successfully', {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: '#2E86DE', // matches your primary button color
      textColor: '#fff',
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  };

  const handleSubmit = () => {
    if (!machineCode || !model || !category || !description) {
      Toast.show('Please fill all fields before submitting.', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#e74c3c',
        textColor: '#fff',
      });
      return;
    }
    // TODO: Wire to your submit logic / API
    showSuccessToast();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>New Service Request</Text>
          <Text style={styles.helper}>Provide details about your issue to help us resolve it faster.</Text>
          <Text style={styles.label}>Machine Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Machine Code"
            value={machineCode}
            onChangeText={setMachineCode}
          />
          <Text style={styles.label}>Machine Model</Text>
          <TouchableOpacity style={styles.select} onPress={() => { /* TODO: open model picker */ }}>
            <Text style={styles.selectText}>{model ? model : 'Select Model...'}</Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0A6" />
          </TouchableOpacity>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.select} onPress={() => { /* TODO: open category picker */ }}>
            <Text style={styles.selectText}>{category ? category : 'Select Category...'}</Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0A6" />
          </TouchableOpacity>
          <View style={styles.row}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleUpload}>
              <Ionicons name="camera" size={18} color="#2E86DE" />
              <Text style={styles.actionText}>Upload Photo/Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleAudio}>
              <Ionicons name="mic" size={18} color="#2E86DE" />
              <Text style={styles.actionText}>Audio Input</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Description of Issue</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe the issue..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <TouchableOpacity style={[styles.submitBtn, (!machineCode || !model || !category || !description) && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={!machineCode || !model || !category || !description}>
            <Text style={styles.submitText}>Submit Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Past Tickets</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/Tickets' as any)}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentTickets.map((t: Ticket) => (
          <View key={t.id} style={styles.pastCard}>
            <View>
              <Text style={styles.pastTitle}>{t.title}</Text>
              <Text style={styles.pastMeta}>{t.date} • {t.model}</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn} onPress={() => router.push({ pathname: '/(tabs)/Tickets/[id]' as any, params: { id: String(t.id) } })}>
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        ))}

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
    paddingTop: 60, // You can adjust this value to control the space at the top.
    paddingBottom: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#202124',
    marginBottom: 12,
  },
  helper: {
    color: '#6b7280',
    marginBottom: 8,
  },
  label: {
    color: '#5F6368',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  select: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: '#9AA0A6',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 14,
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: {
    color: '#2E86DE',
    fontWeight: '600',
  },
  textarea: {
    height: 120,
    marginTop: 6,
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: '#2E86DE',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  sectionHeaderRow: {
    marginTop: 24,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  link: {
    color: '#2E86DE',
    fontWeight: '700',
  },
  pastCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pastTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  pastMeta: {
    color: '#6b7280',
    marginTop: 4,
  },
  viewBtn: {
    backgroundColor: '#2E86DE',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  viewBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});
