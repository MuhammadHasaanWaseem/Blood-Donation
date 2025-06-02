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
import { FontAwesome5 } from "@expo/vector-icons";

export default function HospitalDetails() {
  const { id } = useLocalSearchParams();
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching hospital:", error.message);
      } else {
        setHospital(data);
      }

      setLoading(false);
    };

    if (id) {
      fetchHospitalDetails();
    }
  }, [id]);

  const handleAppointmentSubmit = async () => {
    if (!name || !bloodGroup || !contact) {
      Alert.alert("Missing Information", "Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    const user = supabase.auth.user(); // older version
    const userId = user?.id;

    if (!userId) {
      Alert.alert("Authentication Required", "Please log in to continue.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert([
      {
        user_id: userId,
        hospital_id: id,
        name,
        blood_group: bloodGroup,
        medical_history: medicalHistory,
        contact,
      },
    ]);

    if (error) {
      Alert.alert("Error", error.message || "Failed to book appointment.");
    } else {
      Alert.alert("Success", "Appointment booked successfully.");
      setModalVisible(false);
      setName("");
      setBloodGroup("");
      setMedicalHistory("");
      setContact("");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Hospital not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={
              hospital.photo_url
                ? { uri: hospital.photo_url }
                : require("../../assets/images/hospital-icon.jpg")
            }
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.name}>{hospital.name}</Text>
        <Text style={styles.specialization}>{hospital.location}</Text>

        <View style={styles.infoBox}>
          <InfoRow label="Departments" value={hospital.departments || "N/A"} />
          <InfoRow label="Phone" value={hospital.contactNumber || "N/A"} />
          <InfoRow label="Email" value={hospital.email || "N/A"} />
          <InfoRow label="City" value={hospital.address || "N/A"} />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome5 name="calendar-check" size={24} color="#3B82F6" />
          <Text style={styles.iconButtonText}>Book Appointment</Text>
        </TouchableOpacity>

        {/* Appointment Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => !submitting && setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Book Appointment</Text>

              <ScrollView keyboardShouldPersistTaps="handled">
                <TextInput
                  placeholder="Your Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Blood Group"
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Medical History (Optional)"
                  value={medicalHistory}
                  onChangeText={setMedicalHistory}
                  style={[styles.input, { height: 80 }]}
                  multiline
                />
                <TextInput
                  placeholder="Contact"
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </ScrollView>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#ef4444" }]}
                  onPress={() => setModalVisible(false)}
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
    borderRadius: 88,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#d1d5db",
    borderWidth: 3,
    borderColor: "#3B82F6",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 88,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
    textAlign: "center",
  },
  specialization: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3B82F6",
    marginBottom: 20,
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
