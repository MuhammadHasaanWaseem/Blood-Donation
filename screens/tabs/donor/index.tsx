import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

type Appointment = {
  id: string;
  doctor_id: string;
  hospital_id: string;
  name: string;
  blood_group: string;
  medical_history: string | null;
  contact: string;
  created_at: string;
  status: string;
  doctors?: { name: string };
  hospitals?: { name: string };
};

export default function UserAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    setRefreshing(true);
    const user = supabase.auth.user();
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`*, doctors(name), hospitals(name)`)
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching appointments:", error);
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) {
        console.error("Error cancelling appointment:", error);
      } else {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Unexpected error cancelling appointment:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      case "completed":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!appointments.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyText}>No appointments scheduled</Text>
        <Text style={styles.emptySubtext}>
          Book your first appointment to get started
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchAppointments}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Appointments</Text>
        <TouchableOpacity onPress={fetchAppointments} style={styles.refreshIcon}>
          <Ionicons
            name="refresh"
            size={24}
            color={refreshing ? "#4f46e5" : "#4b5563"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={fetchAppointments}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoContainer}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#4b5563"
                style={styles.icon}
              />
              <View>
                <Text style={styles.label}>PATIENT NAME</Text>
                <Text style={styles.value}>{item.name}</Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons
                name="medkit-outline"
                size={18}
                color="#4b5563"
                style={styles.icon}
              />
              <View>
                <Text style={styles.label}>DOCTOR</Text>
                <Text style={styles.value}>
                  {item.doctors?.name || "Not specified"}
                </Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons
                name="business-outline"
                size={18}
                color="#4b5563"
                style={styles.icon}
              />
              <View>
                <Text style={styles.label}>HOSPITAL</Text>
                <Text style={styles.value}>
                  {item.hospitals?.name || "Not specified"}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.infoBlock}>
                <Text style={styles.blockLabel}>BLOOD GROUP</Text>
                <Text style={styles.blockValue}>{item.blood_group}</Text>
              </View>
              
              <View style={styles.infoBlock}>
                <Text style={styles.blockLabel}>CONTACT</Text>
                <Text style={styles.blockValue}>{item.contact}</Text>
              </View>
            </View>

            {item.medical_history && (
              <View style={styles.medicalContainer}>
                <Text style={styles.medicalLabel}>MEDICAL HISTORY</Text>
                <Text style={styles.medicalText}>{item.medical_history}</Text>
              </View>
            )}

            {(item.status.toLowerCase() !== "cancelled" && item.status.toLowerCase() !== "completed") && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelAppointment(item.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7ff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
    backgroundColor: "#f5f7ff",
  },
  header: {
    marginTop:10,
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
  },
  refreshIcon: {
        marginTop:10,

    padding: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#312e81",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoBlock: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "48%",
  },
  blockLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  blockValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
  },
  medicalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  medicalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  medicalText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
