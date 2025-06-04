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
import {
  CalendarCheck,
  Phone,
  Mail,
  MapPin,
  Hospital as HospitalIcon,
} from "lucide-react-native";

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

      if (error) console.error("Error fetching hospital:", error.message);
      else setHospital(data);

      setLoading(false);
    };

    if (id) fetchHospitalDetails();
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

    Alert.alert("Debug", `User: ${user ? JSON.stringify(user) : "No user found"}`);

    if (!user) {
      Alert.alert("Authentication Required", "Please log in to continue.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      hospital_id: id,
      name,
      blood_group: bloodGroup,
      medical_history: medicalHistory,
      contact,
    });

    if (error) {
      Alert.alert("Error", error.message || "Failed to book appointment.");
      console.error("Appointment insert error:", error);
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

  if (loading)
    return (
      <Centered>
        <ActivityIndicator size="large" color="#EF4444" />
      </Centered>
    );

  if (!hospital)
    return (
      <Centered>
        <Text style={styles.notFoundText}>Hospital not found.</Text>
      </Centered>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          {hospital.photo_url ? (
            <Image source={{ uri: hospital.photo_url }} style={styles.image} />
          ) : (
            <HospitalIcon size={72} color="#9CA3AF" />
          )}
        </View>

        <Text style={styles.name}>{hospital.name}</Text>
        {hospital.location && (
          <View style={styles.locationRow}>
            <MapPin size={16} color="#EF4444" />
            <Text style={styles.locationText}>{hospital.location}</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Info label="Departments" value={hospital.departments || "N/A"} />
          <Info
            label="Phone"
            value={hospital.contactNumber || "N/A"}
            onPress={() => hospital.contactNumber && openPhone(hospital.contactNumber)}
          />
          <Info
            label="Email"
            value={hospital.email || "N/A"}
            onPress={() => hospital.email && openEmail(hospital.email)}
          />
          <Info label="Address" value={hospital.address || "N/A"} />
          <Info label="Beds" value={hospital.beds || "N/A"} />
          <Info label="Location" value={hospital.location || "N/A"} />
          <Info label="Ratings" value={hospital.rating || "N/A"} />
          <Info label="Established Year" value={hospital.establishedYear || "N/A"} />
          <Info label="Manager" value={hospital.manager || "N/A"} />
          <Info label="Website" value={hospital.website || "N/A"} />
          <Info label="License" value={"Authorized"} />
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

const Centered = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.centered}>{children}</View>
);

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

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
    marginTop: 10,
  },
  centered: {
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  locationText: {
    fontSize: 15,
    color: "#374151",
    marginLeft: 6,
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
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginTop: 36,
    shadowColor: "#EF4444",
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
