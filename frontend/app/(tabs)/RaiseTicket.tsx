// app/(tabs)/RaiseTicket.tsx
"use client"

// @ts-nocheck

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
// ✅ FIX: Using only expo-audio (no expo-av)
import { RecordingPresets, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// ✅ FIX: Use new SafeAreaView to stop warnings
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-root-toast";

// FIRESTORE
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
// ✅ Ensure this path is correct for your project structure
import { db } from "../../firebaseConfig";

const OPTION_ROW_HEIGHT = 48
const { height: WINDOW_HEIGHT } = Dimensions.get("window")
const DROPDOWN_MAX_HEIGHT = Math.min(OPTION_ROW_HEIGHT * 3, Math.floor(WINDOW_HEIGHT * 0.5))

export default function RaiseTicket() {

  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })

    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const router = useRouter()

  // Machine selection (machineCode from firestore)
  const [selectedMachine, setSelectedMachine] = useState("") 
  const [machineQuery, setMachineQuery] = useState("")
  const [showMachineSuggestions, setShowMachineSuggestions] = useState(false)

  // Description and attachments
  const [description, setDescription] = useState("")
  const [attachments, setAttachments] = useState<Array<{ type: "image" | "video" | "audio"; uri: string; durationMs?: number }>>([])
  const [showMediaOptions, setShowMediaOptions] = useState(false)

  // Audio recorder/player
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(audioRecorder)

  // Viewer
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerMedia, setViewerMedia] = useState<{ type: "image" | "video"; uri: string } | null>(null)

  // Firestore machines
  const [machinesList, setMachinesList] = useState<{ id: string; machineCode: string }[]>([])
  const [loadingMachines, setLoadingMachines] = useState(true)

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const currentUserStr = await AsyncStorage.getItem("currentUser");
        if (!currentUserStr) return;

        const user = JSON.parse(currentUserStr); 
        const q = query(collection(db, "machines"), where("assignedTo", "==", user.id));

        const snapshot = await getDocs(q);
        const machines: { id: string; machineCode: string }[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          machines.push({ id: docSnap.id, machineCode: data.machineCode || "" });
        });

        setMachinesList(machines);
      } catch (err) {
        console.log("Error fetching machines:", err);
        Toast.show("Failed to fetch machines");
      } finally {
        setLoadingMachines(false);
      }
    };

    fetchMachines();
  }, []);

  const filteredMachines = useMemo(() => {
    const q = (machineQuery || "").trim().toLowerCase()
    return q ? machinesList.filter((m) => (m.machineCode || "").toLowerCase().includes(q)) : machinesList
  }, [machineQuery, machinesList])

  const isMachineValid = !!selectedMachine && machinesList.some((m) => m.machineCode === selectedMachine) && machineQuery === selectedMachine

  const handleUpload = () => {
    setShowMediaOptions((v) => !v)
  }

  const ensureMediaPermissions = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync()
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (cam.status !== "granted" || lib.status !== "granted") {
      Toast.show("Camera/Library permission is required", { duration: Toast.durations.SHORT })
      return false
    }
    return true
  }

  const pickFromLibrary = async () => {
    setShowMediaOptions(false)
    const ok = await ensureMediaPermissions()
    if (!ok) return
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: false, quality: 0.8 })
    if (res.canceled) return
    const asset = res.assets?.[0]
    if (!asset) return
    const type = (asset.type === "video" ? "video" : "image") as "image" | "video"
    setAttachments((prev) => [...prev, { type, uri: asset.uri }])
  }

  const capturePhoto = async () => {
    setShowMediaOptions(false)
    const ok = await ensureMediaPermissions()
    if (!ok) return
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 })
    if (res.canceled) return
    const asset = res.assets?.[0]
    if (!asset) return
    setAttachments((prev) => [...prev, { type: "image", uri: asset.uri }])
  }

  const captureVideo = async () => {
    setShowMediaOptions(false)
    const ok = await ensureMediaPermissions()
    if (!ok) return
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, videoMaxDuration: 60, quality: ImagePicker.UIImagePickerControllerQualityType.Medium })
    if (res.canceled) return
    const asset = res.assets?.[0]
    if (!asset) return
    setAttachments((prev) => [...prev, { type: "video", uri: asset.uri }])
  }

  // ✅ FIXED: New handleAudio using only expo-audio
  const handleAudio = async () => {
    try {
      if (recorderState.isRecording) {
        await stopRecording()
        return
      }

      // Automatically requests permissions when recording starts
      await audioRecorder.record()
      Toast.show("Recording... tap mic again to stop", { duration: Toast.durations.SHORT })
      
    } catch (e) {
      console.log("Audio error:", e)
      Toast.show("Microphone permission required", { duration: Toast.durations.SHORT })
    }
  }

  // ✅ FIXED: New stopRecording using only expo-audio
  const stopRecording = async () => {
    try {
      await audioRecorder.stop()
      
      const uri = audioRecorder.uri
      // Use recorderState duration or calculate if needed
      const duration = recorderState.durationMillis || 0

      if (uri) {
        setAttachments((prev) => [
          ...prev,
          { type: "audio", uri, durationMs: duration },
        ])
        Toast.show("Recording saved", { duration: Toast.durations.SHORT })
      }
    } catch (e) {
      console.log("Stop error:", e)
      Toast.show("Failed to stop recording", { duration: Toast.durations.SHORT })
    }
  }


  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const showSuccessToast = () => {
    Toast.show("Request submitted successfully", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: "#2E86DE",
      textColor: "#fff",
      containerStyle: { marginBottom: 60 },
    })
  }

  const handleSubmit = async () => {
    const errors: string[] = []
    if (!isMachineValid) errors.push("Machine: Please select a valid machine from the list.")
    if (!description.trim()) errors.push("Description: Please enter a description.")

    if (errors.length) {
      Toast.show(errors.join("\n"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: "#e67e22",
        textColor: "#fff",
        containerStyle: { marginBottom: 60 },
      })
      return
    }

    try {
      const currentUserStr = await AsyncStorage.getItem("currentUser")
      if (!currentUserStr) throw new Error("User not found")

      const user = JSON.parse(currentUserStr)

      // Ensure metadata counter exists
      const counterRef = doc(db, "metadata", "ticketCounter")
      const counterSnap = await getDoc(counterRef)
      if (!counterSnap.exists()) {
        await setDoc(counterRef, { lastTicketNumber: 0 })
      }

      // Atomic increment
      await updateDoc(counterRef, { lastTicketNumber: increment(1) })

      // Read updated counter
      const updatedSnap = await getDoc(counterRef)
      const nextNumber = updatedSnap.data()?.lastTicketNumber || 0 // numeric

      // Prepare ticket object
      const newTicket = {
        userId: user.id,
        userName: user.name,
        machineCode: selectedMachine,
        ticketId: nextNumber, // number stored in Firestore
        description,
        attachments,
        status: "open",
        createdAt: serverTimestamp(),
      }

      // Save to Firestore
      await addDoc(collection(db, "tickets"), newTicket)

      showSuccessToast()
      // Reset fields
      setSelectedMachine("")
      setMachineQuery("")
      setDescription("")
      setAttachments([])

      router.replace("/(tabs)/Tickets") 
    } catch (err) {
      console.log("Error submitting ticket:", err)
      Toast.show("Failed to submit ticket", { duration: Toast.durations.SHORT })
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 85 + keyboardHeight },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!showMachineSuggestions}
        nestedScrollEnabled
      >
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <View style={styles.card}>
            <Text style={styles.title}>New Service Request</Text>
            <Text style={styles.helper}>
              Provide details about your issue to help us resolve it faster.
            </Text>

            <Text style={styles.label}>Machine Model</Text>
            <View style={[styles.fieldContainer, showMachineSuggestions && styles.fieldContainerRaised]}>
              <View
                style={[
                  styles.select,
                  { gap: 8 },
                  !isMachineValid && machineQuery.length > 0 && styles.selectInvalid,
                  showMachineSuggestions && styles.selectRaised,
                ]}
              >
                <Ionicons name="search" size={16} color="#9AA0A6" />
                <TextInput
                  style={{ flex: 1, padding: 0, color: machineQuery ? "#222" : "#9AA0A6" }}
                  placeholder={loadingMachines ? "Loading machines..." : "Machine Code..."}
                  placeholderTextColor="#9AA0A6"
                  value={machineQuery}
                  onChangeText={(txt) => {
                    setMachineQuery(txt)
                    setShowMachineSuggestions(true)
                    if (txt !== selectedMachine) setSelectedMachine("")
                  }}
                  onFocus={() => {
                    setShowMachineSuggestions(true)
                  }}
                  onBlur={() => {}}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
              </View>

              {showMachineSuggestions && (
                <View style={styles.suggestionsDropdown}>
                  {filteredMachines.length > 0 ? (
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      keyboardDismissMode="on-drag"
                      showsVerticalScrollIndicator
                      persistentScrollbar
                      style={{ maxHeight: DROPDOWN_MAX_HEIGHT }}
                      contentContainerStyle={{ paddingVertical: 2 }}
                    >
                      {filteredMachines.map((m) => (
                        <View key={m.id}>
                          <TouchableOpacity
                            style={[styles.inlineOption, { minHeight: OPTION_ROW_HEIGHT }]}
                            onPress={() => {
                              setSelectedMachine(m.machineCode)
                              setMachineQuery(m.machineCode)
                              setShowMachineSuggestions(false)
                              Keyboard.dismiss()
                            }}
                          >
                            <Text style={styles.inlineOptionText}>{m.machineCode}</Text>
                          </TouchableOpacity>
                          <View style={styles.inlineSeparator} />
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noResultsContainer}>
                      <Ionicons name="search" size={16} color="#6b7280" />
                      <Text style={styles.noResults}>No matches</Text>
                    </View>
                  )}
                </View>
              )}

              {!showMachineSuggestions && machineQuery.length > 0 && !isMachineValid && (
                <Text style={styles.invalidHint}>Select a valid machine from the list</Text>
              )}
            </View>

            {selectedMachine ? (
              <Text style={{ marginTop: 8, fontWeight: "700", color: "#222" }}>Machine: {selectedMachine}</Text>
            ) : null}

            <Text style={styles.label}>Description of Issue</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe the issue..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              scrollEnabled={false}
            />

            <View style={styles.row}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleUpload}>
                <Ionicons name="camera" size={18} color="#2E86DE" />
                <Text style={styles.actionText}>Upload Attachment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                    styles.actionBtn, 
                    recorderState.isRecording && { backgroundColor: '#ffebee', borderColor: '#ef5350' }
                ]}
                onPress={recorderState.isRecording ? stopRecording : handleAudio}
              >
                <Ionicons 
                    name={recorderState.isRecording ? "square" : "mic"} 
                    size={18} 
                    color={recorderState.isRecording ? "#d32f2f" : "#2E86DE"} 
                />
                <Text style={[
                    styles.actionText,
                    recorderState.isRecording && { color: "#d32f2f" }
                ]}>
                    {recorderState.isRecording ? "Stop" : "Audio Input"}
                </Text>
              </TouchableOpacity>
            </View>

            {showMediaOptions && (
              <View style={styles.inlineDropdown}>
                <TouchableOpacity style={styles.inlineOption} onPress={capturePhoto}>
                  <Text style={styles.inlineOptionText}>Take Photo</Text>
                </TouchableOpacity>
                <View style={styles.inlineSeparator} />
                <TouchableOpacity style={styles.inlineOption} onPress={captureVideo}>
                  <Text style={styles.inlineOptionText}>Record Video</Text>
                </TouchableOpacity>
                <View style={styles.inlineSeparator} />
                <TouchableOpacity style={styles.inlineOption} onPress={pickFromLibrary}>
                  <Text style={styles.inlineOptionText}>Choose from Library</Text>
                </TouchableOpacity>
              </View>
            )}

            {attachments.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>Preview</Text>
                <View style={styles.previewGrid}>
                  {attachments.map((a, idx) => (
                    <View key={`${a.uri}-${idx}`} style={styles.previewItem}>
                      {a.type === "image" ? (
                        <Pressable onPress={() => { setViewerMedia({ type: "image", uri: a.uri }); setViewerVisible(true) }}>
                          <Image source={{ uri: a.uri }} style={styles.previewImage} contentFit="cover" />
                        </Pressable>
                      ) : a.type === "video" ? (
                        <VideoPreview uri={a.uri} onPress={() => { setViewerMedia({ type: "video", uri: a.uri }); setViewerVisible(true) }} />
                      ) : (
                        <AudioPlayer uri={a.uri} durationMs={a.durationMs} />
                      )}
                      <TouchableOpacity style={styles.removeBadge} onPress={() => removeAttachment(idx)}>
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, (!selectedMachine || !description.trim()) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!selectedMachine || !description.trim()}
            >
              <Text style={styles.submitText}>Submit Request</Text>
            </TouchableOpacity>

            <MediaViewer visible={viewerVisible} media={viewerMedia} onClose={() => setViewerVisible(false)} />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

/* ---------------- styles and helper components ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E8ECF5" },
  container: { flex: 1 },
  content: { padding: 18, paddingTop: 20, paddingBottom: 85 }, // adjusted top padding for SafeAreaView
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#202124", marginBottom: 12 },
  helper: { color: "#6b7280", marginBottom: 12 },
  label: {
    color: "#5F6368",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  select: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectInvalid: {
    borderColor: "#FF8C00",
    shadowColor: "#FF8C00",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  invalidHint: {
    color: "#FF8C00",
    fontSize: 12,
    marginTop: 6,
  },
  selectText: { color: "#9AA0A6", fontSize: 14 },
  selectTextSelected: { color: "#222", fontSize: 14 },
  row: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 14,
  },
  actionBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: { color: "#2E86DE", fontWeight: "600" },
  textarea: { height: 120, marginTop: 6 },
  submitBtn: {
    marginTop: 16,
    backgroundColor: "#2E86DE",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  inlineDropdown: {
    backgroundColor: "#eeeeee",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  inlineOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  inlineOptionText: { fontSize: 14, color: "#222" },
  inlineSeparator: { height: 1, backgroundColor: "#999999" },
  suggestionsDropdown: {
    backgroundColor: "#eeeeee",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 6,
    overflow: "hidden",
  },
  backdrop: {
    position: "absolute",
    top: -2000,
    bottom: -2000,
    left: -2000,
    right: -2000,
    backgroundColor: "transparent",
    zIndex: 5,
  },
  noResultsContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noResults: { color: "#6b7280", fontStyle: "italic" },
  fieldContainer: { position: "relative" },
  fieldContainerRaised: { zIndex: 50, elevation: 8 },
  fieldContainerBelow: { zIndex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInput: { flex: 1, fontSize: 14, color: "#222", padding: 0 },
  selectRaised: { zIndex: 30, elevation: 12 },
  previewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 as unknown as number },
  previewItem: {
    width: 120,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f1f5f9",
  },
  previewImage: { width: "100%", height: "100%", borderRadius: 10 },
  previewVideo: { width: "100%", height: "100%", borderRadius: 10, backgroundColor: "#000" },
  playOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    paddingHorizontal: 10,
    height: "100%",
  },
  audioBtn: {
    backgroundColor: "#1e90ff",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  audioText: { color: "#222", fontWeight: "600", flexShrink: 1, maxWidth: 80 },
})

function VideoPreview({ uri, onPress }: { uri: string; onPress: () => void }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false
    player.muted = true
  })

  return (
    <Pressable onPress={onPress}>
      <View style={{ width: "100%", height: "100%" }}>
        <VideoView
          player={player}
          style={styles.previewVideo}
          nativeControls={false}
          contentFit="cover"
        />
        <View style={styles.playOverlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={18} color="#fff" />
          </View>
        </View>
      </View>
    </Pressable>
  )
}

function MediaViewer({ visible, media, onClose }: { visible: boolean; media: { type: "image" | "video"; uri: string } | null; onClose: () => void }) {
  const videoPlayer = useVideoPlayer(media?.type === "video" ? media.uri : "", (player) => {
    player.loop = false
  })

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={viewerStyles.backdrop}>
        <Pressable style={viewerStyles.backdropFill} onPress={onClose} />
        <View style={viewerStyles.centered}>
          <View style={viewerStyles.content}>
            {media?.type === "image" ? (
              <Image source={{ uri: media.uri }} style={viewerStyles.image} contentFit="contain" />
            ) : media?.type === "video" ? (
              <VideoView player={videoPlayer} style={viewerStyles.video} nativeControls contentFit="contain" />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const viewerStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  backdropFill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { width: '92%', height: '70%', borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  video: { width: '100%', height: '100%', backgroundColor: '#000' },
})

function AudioPlayer({ uri, durationMs }: { uri: string; durationMs?: number }) {
  const player = useAudioPlayer(uri)

  const toggle = () => {
    try {
      if (player.playing) {
        player.pause()
      } else {
        player.play()
      }
    } catch (e) {
      Toast.show("Audio error", { duration: Toast.durations.SHORT })
    }
  }

  const fmt = (ms?: number) => {
    if (!ms) return ""
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, "0")}`
  }

  return (
    <View style={styles.audioRow}>
      <TouchableOpacity style={styles.audioBtn} onPress={toggle}>
        <Ionicons name={player.playing ? "pause" : "play"} size={16} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.audioText}>{fmt(durationMs)}</Text>
    </View>
  )
}