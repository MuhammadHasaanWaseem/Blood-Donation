import { SearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import
import { useSearchParams } from "expo-router/build/hooks";

export default function DoctorDetails() {
  const { id } = useSearchParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [registration, setRegistration] = useState({
    name: "",
    blood_group: "",
    medical_history: "",
    contact: "",
  });

  useEffect(() => {
    if (id) {
      fetchDoctor(id);
      fetchUserRegistration();
    }
  }, [id]);

  async function fetchDoctor(docId) {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", docId)
      .single();

    if (error) {
      Alert.alert("Error", "Doctor not found");
      router.back();
      return;
    }

    setDoctor(data);
    setLoading(false);
  }

  async function fetchUserRegistration() {
    const user = supabase.auth.user();
    if (!user) return;

    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.log("Registration not found", error.message);
      return;
    }

    setRegistration({
      name: data.name || "",
      blood_group: data.blood_group || "",
      medical_history: data.medical_history || "",
      contact: "", // add contact if needed
    });
  }

  async function applyAppointment() {
    const user = supabase.auth.user();
    if (!user) {
      Alert.alert("Error", "Please log in first");
      return;
    }

    const appointment = {
      user_id: user.id,
      doctor_id: doctor.id,
      name: registration.name,
      blood_group: registration.blood_group,
      medical_history: registration.medical_history,
      contact: registration.contact,
      requested_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("appointments").insert([appointment]);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Appointment request sent");
    router.back();
  }

  if (loading) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{doctor.name}</Text>
      <Text>Specialization: {doctor.specialization}</Text>
      <Text>Hospital: {doctor.hospital}</Text>
      <Text>Experience: {doctor.experience} years</Text>
      <Text>Phone: {doctor.phone}</Text>
      <Text>Email: {doctor.email}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={registration.name}
          onChangeText={(text) =>
            setRegistration((prev) => ({ ...prev, name: text }))
          }
        />

        <Text style={styles.label}>Blood Group</Text>
        <TextInput
          style={styles.input}
          value={registration.blood_group}
          onChangeText={(text) =>
            setRegistration((prev) => ({ ...prev, blood_group: text }))
          }
        />

        <Text style={styles.label}>Medical History</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={registration.medical_history}
          onChangeText={(text) =>
            setRegistration((prev) => ({ ...prev, medical_history: text }))
          }
        />

        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={registration.contact}
          onChangeText={(text) =>
            setRegistration((prev) => ({ ...prev, contact: text }))
          }
        />

        <Button title="Apply for Appointment" onPress={applyAppointment} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  form: { marginTop: 24 },
  label: { fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
});
