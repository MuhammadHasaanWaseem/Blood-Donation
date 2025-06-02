import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";

export default function HospitalList() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    setLoading(true);
    const { data, error } = await supabase.from("hospitals").select("*");
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setHospitals(data);
    setLoading(false);
  }

  function handleHospitalPress(id: string) {
    router.push({
      pathname: "/hospitaldetails",
      params: { id },
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Hospitals</Text>
      <FlatList
        data={hospitals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleHospitalPress(item.id)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.manager}>Manager: {item.manager}</Text>
            <Text style={styles.website}>Website: {item.website}</Text>
            <Text style={styles.address}>🏥 {item.address}</Text>
            <Text style={styles.contact}>📞 {item.contactNumber}</Text>
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
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  location: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
  },
  manager: {
    fontSize: 14,
    color: "#6B7280",
  },
  website: {
    fontSize: 14,
    color: "#3B82F6",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#4B5563",
  },
  contact: {
    fontSize: 14,
    color: "#B71C1C",
    fontWeight: "600",
    marginTop: 2,
  },
});
