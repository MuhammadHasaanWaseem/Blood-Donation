import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  doctor_id: string;
  hospital_id: string;
  name: string;
  blood_group: string;
  medical_history: string | null;
  contact: string;
  created_at: string;
  doctors?: { name: string };
  hospitals?: { name: string };

};

export default function UserAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const user = supabase.auth.user();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .select(`*, doctors(name),hospitals(name)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching appointments:", error);
      } else {
        setAppointments(data || []);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  if (!appointments.length)
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You have no appointments yet.</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Appointments</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.doctorName}>
                {item.doctors?.name
                  ? `Dr. ${item.doctors.name}`
                  : item.hospitals?.name
                    ? `Hospital : ${item.hospitals.name}`
                    : "Unknown"}
              </Text>

            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Patient Name:</Text>
              <Text style={styles.value}>{item.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Blood Group:</Text>
              <Text style={styles.value}>{item.blood_group}</Text>
            </View>

            {item.medical_history ? (
              <View style={styles.row}>
                <Text style={styles.label}>Medical History:</Text>
                <Text style={styles.value}>{item.medical_history}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{item.contact}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>status:</Text>
              <Text style={{ color: 'red' }}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  emptyText: {
    fontSize: 18,
    color: "#9ca3af",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: "#4b5563",
    fontSize: 15,
    maxWidth: "45%",
  },
  value: {
    color: "#111827",
    fontWeight: "500",
    maxWidth: "50%",
    textAlign: "right",
    fontSize: 15,
  },
});
