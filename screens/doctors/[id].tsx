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
  Linking,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { User, Phone, Mail, CalendarCheck } from "lucide-react-native";

export default function DoctorDetails() {
  const { id } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching doctor:", error.message);
      } else {
        setDoctor(data);
      }

      setLoading(false);
    };

    if (id) fetchDoctorDetails();
  }, [id]);

  const openPhone = (num: string) => Linking.openURL(`tel:${num}`);
  const openEmail = (em: string) => Linking.openURL(`mailto:${em}`);

  const handleAppointmentSubmit = async () => {
    if (!name || !bloodGroup || !contact) {
      Alert.alert("Missing Information", "Please fill all required fields.");
      return;
    }
    setSubmitting(true);

    const user = supabase.auth.user();
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to continue.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      doctor_id: id,
      name,
      blood_group: bloodGroup,
      medical_history: medicalHistory,
      contact,
    });

    if (error) Alert.alert("Error", error.message || "Failed to book appointment.");
    else {
      Alert.alert("Success", "Appointment booked successfully.");
      setModalVisible(false);
      setName("");
      setBloodGroup("");
      setMedicalHistory("");
      setContact("");
    }
    setSubmitting(false);
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          {doctor.photo_url ? (
            <Image source={{ uri: doctor.photo_url }} style={styles.image} />
          ) : (
            <User size={72} color="#9CA3AF" />
          )}
        </View>

        <Text style={styles.name}>{doctor.name}</Text>
        {doctor.specialization && (
          <Text style={styles.specialization}>{doctor.specialization}</Text>
        )}

        <View style={styles.infoBox}>
          <Info label="Hospital" value={doctor.hospital || "N/A"} />
          <Info label="Experience" value={doctor.experience ? `${doctor.experience} years` : "N/A"} />
          <Info
            label="Phone"
            value={doctor.phone || "N/A"}
            onPress={() => doctor.phone && openPhone(doctor.phone)}
          />
          <Info
            label="Email"
            value={doctor.email || "N/A"}
            onPress={() => doctor.email && openEmail(doctor.email)}
          />
          <Info label="Gender" value={doctor.gender || "N/A"} />
          <Info label="Timings" value={doctor.availability || "N/A"} />
          <Info label="Fee" value={doctor.fee || "N/A"} />
          <Info label="Language" value={doctor.languagesKnown || "N/A"} />

        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <CalendarCheck size={22} color="#fff" />
          <Text style={styles.actionText}>Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => !submitting && setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Book Appointment</Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                placeholder="Your Name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                placeholder="Blood Group"
                placeholderTextColor="#9CA3AF"
                value={bloodGroup}
                onChangeText={setBloodGroup}
                style={styles.input}
              />
              <TextInput
                placeholder="Medical History (optional)"
                placeholderTextColor="#9CA3AF"
                value={medicalHistory}
                onChangeText={setMedicalHistory}
                style={[styles.input, { height: 96 }]}
                multiline
              />
              <TextInput
                placeholder="Contact Number"
                placeholderTextColor="#9CA3AF"
                value={contact}
                onChangeText={setContact}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </ScrollView>

            <View style={styles.btnRow}>
              <AppBtn
                title="Cancel"
                color="#6B7280"
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              />
              <AppBtn
                title={submitting ? "Submitting..." : "Submit"}
                color="#3B82F6"
                onPress={handleAppointmentSubmit}
                disabled={submitting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const Info = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={styles.infoRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, onPress && { color: "#3B82F6" }]}>
      {value}
    </Text>
  </TouchableOpacity>
);

const AppBtn = ({
  title,
  color,
  onPress,
  disabled,
}: {
  title: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.modalBtn, { backgroundColor: color, opacity: disabled ? 0.7 : 1 }]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.85}
  >
    <Text style={styles.modalBtnText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  notFoundText: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "600",
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
  },
  specialization: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 24,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  infoValue: {
    fontSize: 15,
    color: "#6B7280",
    flexShrink: 1,
    textAlign: "right",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B71C1C",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginTop: 36,
    shadowColor: "#B71C1C",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 6,
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
