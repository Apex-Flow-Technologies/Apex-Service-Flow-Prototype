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
  Modal,
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
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
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

  // Bottom-sheet style dropdown
  const renderDropdown = (visible, setVisible, data, setValue) => (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setVisible(false)}
      >
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Select Option</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
                  setValue(item);
                  setVisible(false);
                }}
              >
                <Text style={styles.sheetItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </TouchableOpacity>
    </Modal>
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
            onPress={() => setModelModalVisible(true)}
          >
            <Text style={model ? styles.selectTextSelected : styles.selectText}>
              {model || 'Select Model...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0A6" />
          </TouchableOpacity>

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={category ? styles.selectTextSelected : styles.selectText}>
              {category || 'Select Category...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0A6" />
          </TouchableOpacity>

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

      {/* Dropdown Modals */}
      {renderDropdown(modelModalVisible, setModelModalVisible, MACHINE_MODELS, setModel)}
      {renderDropdown(categoryModalVisible, setCategoryModalVisible, CATEGORIES, setCategory)}
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

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: 350,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 8 },
  sheetItem: { paddingVertical: 14 },
  sheetItemText: { fontSize: 15, color: '#222' },
  separator: { height: 1, backgroundColor: '#eee' },
});
