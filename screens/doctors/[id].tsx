import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { FontAwesome5 } from '@expo/vector-icons'; // icon library

export default function DoctorDetails() {
  const { id } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal & form state
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        console.error("Error:", error);
      } else {
        setDoctor(data);
      }
      setLoading(false);
    };

    if (id) fetchDoctor();
  }, [id]);

  const handleAppointmentSubmit = async () => {
    if (!name || !bloodGroup || !contact) {
      Alert.alert("Please fill all required fields (Name, Blood Group, Contact).");
      return;
    }

    setSubmitting(true);

    const user = supabase.auth.user();
    if (!user) {
      Alert.alert("You must be logged in to book an appointment.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert([
      {
        user_id: user.id,
        doctor_id: id,
        name,
        blood_group: bloodGroup,
        medical_history: medicalHistory,
        contact,
      },
    ]);

    if (error) {
      Alert.alert("Failed to book appointment:", error.message);
    } else {
      Alert.alert("Appointment requested successfully!");
      // Clear form and close modal
      setName("");
      setBloodGroup("");
      setMedicalHistory("");
      setContact("");
      setModalVisible(false);
    }

    setSubmitting(false);
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );

  if (!doctor)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Doctor not found.</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.imageContainer}>
          <Image
            source={
              doctor.photo_url
                ? { uri: doctor.photo_url }
                : require("../../assets/images/doctor-icon.jpg")
            }
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialization}>{doctor.specialization}</Text>

        <View style={styles.infoBox}>
          <InfoRow label="Hospital" value={doctor.hospital} />
          <InfoRow label="Experience" value={`${doctor.experience} years`} />
          <InfoRow label="Phone" value={doctor.phone} />
          <InfoRow label="Email" value={doctor.email} />
          <InfoRow label="Gender" value={doctor.gender} />
        </View>

        {/* Appointment icon button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Book Appointment"
        >
          <FontAwesome5 name="calendar-check" size={28} color="#3B82F6" />
          <Text style={styles.iconButtonText}>Book Appointment</Text>
        </TouchableOpacity>

        {/* Appointment Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => !submitting && setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Book Appointment</Text>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 320 }}
              >
                <TextInput
                  placeholder="Your Name"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  editable={!submitting}
                />

                <TextInput
                  placeholder="Blood Group (e.g. A+, O-)"
                  style={styles.input}
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  editable={!submitting}
                />

                <TextInput
                  placeholder="Medical History (optional)"
                  style={[styles.input, { height: 80 }]}
                  value={medicalHistory}
                  onChangeText={setMedicalHistory}
                  multiline
                  editable={!submitting}
                />

                <TextInput
                  placeholder="Contact (phone or email)"
                  style={styles.input}
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                  editable={!submitting}
                />
              </ScrollView>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#ef4444" }]}
                  onPress={() => !submitting && setModalVisible(false)}
                  disabled={submitting}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#3B82F6" }]}
                  onPress={handleAppointmentSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 24,
    backgroundColor: "#f0f4f8",
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  notFoundText: {
    fontSize: 18,
    color: "#ef4444",
  },
  imageContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#d1d5db",
    borderWidth: 3,
    borderColor: "#3B82F6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
    textAlign: "center",
  },
  specialization: {
    fontSize: 18,
    fontWeight: "500",
    color: "#3B82F6",
    marginBottom: 24,
    textAlign: "center",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  infoValue: {
    fontSize: 16,
    color: "#6b7280",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 40,
  },
  iconButtonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#3B82F6",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f9fafb",
    color: "#1e293b",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
