import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Hospital, MapPin, Phone, Mail } from "lucide-react-native";

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

  const openPhone = (number: string) => Linking.openURL(`tel:${number}`);
  const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
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
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleHospitalPress(item.id)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.hospitalIcon]}>
                <Hospital size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>{item.name || "Unknown Hospital"}</Text>
            </View>

            {item.location && (
              <View style={styles.infoRow}>
                <MapPin size={18} color="#EF4444" />
                <Text style={styles.infoText}>{item.location}</Text>
              </View>
            )}

            {item.manager && (
              <Text style={styles.subInfo}>Manager: {item.manager}</Text>
            )}

            {item.website && (
              <Text style={[styles.subInfo, { color: "#3B82F6" }]}>
                Website: {item.website}
              </Text>
            )}

            {item.address && (
              <Text style={styles.subInfo}>🏥 {item.address}</Text>
            )}

            <View style={styles.contactContainer}>
              {item.contactNumber && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => openPhone(item.contactNumber)}
                >
                  <Phone size={16} color="#3B82F6" />
                  <Text style={styles.contactText}>Call</Text>
                </TouchableOpacity>
              )}
              {item.email && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => openEmail(item.email)}
                >
                  <Mail size={16} color="#3B82F6" />
                  <Text style={styles.contactText}>Email</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  hospitalIcon: {
    backgroundColor: "#EF4444",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flexShrink: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#374151",
    marginLeft: 10,
    flexShrink: 1,
  },
  subInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  contactContainer: {
    flexDirection: "row",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
    justifyContent: "space-around",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  contactText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
    marginLeft: 6,
  },
});
