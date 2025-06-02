import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { supabase } from "@/lib/supabase";

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    setLoading(true);
    const { data, error } = await supabase.from("doctors").select("*");
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setDoctors(data);
    setLoading(false);
  }

  function handleDoctorPress(id: string) {
    router.push({
      pathname: '/doctorsdetails',
      params: { id },
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Doctors</Text>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleDoctorPress(item.id)}
          >
            <View style={styles.headerRow}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.experience}>{item.experience} yrs</Text>
            </View>
            <Text style={styles.specialization}>{item.specialization}</Text>
            <Text style={styles.hospital}>🏥 {item.hospital}</Text>
            <Text style={styles.contact}>📞 {item.phone}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#B71C1C",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#B71C1C",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  experience: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  specialization: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
  },
  hospital: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 2,
  },
  contact: {
    fontSize: 14,
    color: "#B71C1C",
    fontWeight: "600",
    marginTop: 2,
  },
});
