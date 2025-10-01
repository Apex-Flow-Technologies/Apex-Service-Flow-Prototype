// @ts-nocheck

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Toast from 'react-native-root-toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MACHINE_MODELS = ['Apex 100', 'Apex 200', 'Apex Pro', 'Apex Ultra'];
const CATEGORIES = ['Mechanical', 'Electrical', 'Software', 'Other'];

export default function RaiseTicket() {
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [modelOpen, setModelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const router = useRouter();

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
      backgroundColor: '#2E86DE',
      textColor: '#fff',
    });
  };

  const handleSubmit = () => {
    if (!model || !category || !description) {
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

  const InlineOptions = ({ data, onSelect }: { data: string[]; onSelect: (v: string) => void }) => (
    <View style={styles.inlineDropdown}>
      {data.map((item) => (
        <TouchableOpacity key={item} style={styles.inlineOption} onPress={() => onSelect(item)}>
          <Text style={styles.inlineOptionText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>New Service Request</Text>
          <Text style={styles.helper}>
            Provide details about your issue to help us resolve it faster.
          </Text>

          <Text style={styles.label}>Machine Model</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => {
              setModelOpen((v) => !v);
              setCategoryOpen(false);
            }}
          >
            <Text style={model ? styles.selectTextSelected : styles.selectText}>
              {model || 'Select Model...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0A6" />
          </TouchableOpacity>
          {modelOpen && (
            <InlineOptions
              data={MACHINE_MODELS}
              onSelect={(val) => {
                setModel(val);
                setModelOpen(false);
              }}
            />
          )}

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => {
              setCategoryOpen((v) => !v);
              setModelOpen(false);
            }}
          >
            <Text style={category ? styles.selectTextSelected : styles.selectText}>
              {category || 'Select Category...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0A6" />
          </TouchableOpacity>
          {categoryOpen && (
            <InlineOptions
              data={CATEGORIES}
              onSelect={(val) => {
                setCategory(val);
                setCategoryOpen(false);
              }}
            />
          )}

          
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


          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!model || !category || !description) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!model || !category || !description}
          >
            <Text style={styles.submitText}>Submit Request</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Inline dropdowns rendered above per-field */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8ECF5' },
  container: { flex: 1 },
  content: { padding: 18, paddingTop: 60, paddingBottom: 0 },
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
  title: { fontSize: 20, fontWeight: '800', color: '#202124', marginBottom: 12 },
  helper: { color: '#6b7280', marginBottom: 12 },
  label: {
    color: '#5F6368',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
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
  selectText: { color: '#9AA0A6', fontSize: 14 },
  selectTextSelected: { color: '#222', fontSize: 14 },
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
  actionText: { color: '#2E86DE', fontWeight: '600' },
  textarea: { height: 120, marginTop: 6 },
  submitBtn: {
    marginTop: 16,
    backgroundColor: '#2E86DE',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Inline dropdown styles
  inlineDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 6,
    overflow: 'hidden',
  },
  inlineOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  inlineOptionText: { fontSize: 14, color: '#222' },
});
