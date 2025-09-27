import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RaiseTicket() {
  const [machineCode, setMachineCode] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleUpload = () => {
    // TODO: Integrate media picker
  };

  const handleAudio = () => {
    // TODO: Integrate audio recorder
  };

  const handleSubmit = () => {
    // TODO: Wire to your submit logic / API
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>New Service Request</Text>

        <Text style={styles.label}>Machine Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Machine Code"
          value={machineCode}
          onChangeText={setMachineCode}
        />

        <Text style={styles.label}>Machine Model</Text>
        <TouchableOpacity style={styles.select}>
          <Text style={styles.selectText}>{model ? model : 'Select Model...'}</Text>
          <Ionicons name="chevron-down" size={18} color="#9AA0A6" />
        </TouchableOpacity>

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.select}>
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

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECF5',
  },
  content: {
    padding: 18,
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
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});