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
import { User, Phone, Mail } from "lucide-react-native";

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<any[]>([]);
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
      pathname: "/doctorsdetails",
      params: { id },
    });
  }

  const openPhone = (number: string) => Linking.openURL(`tel:${number}`);
  const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
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
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => {
          const isApproved = item.approved === true || item.approved === "true";
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleDoctorPress(item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, styles.userIcon]}>
                  <User size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.cardTitle}>{item.name || "Unknown Doctor"}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isApproved ? "#10b981" : "#ef4444" },
                  ]}
                />
              
              </View>

              {item.specialization && (
                <Text style={styles.subInfo}>Specialization: {item.specialization}</Text>
              )}

              {item.hospital && (
                <Text style={styles.subInfo}>Hospital: {item.hospital}</Text>
              )}

              <View style={styles.contactContainer}>
                {item.phone && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => openPhone(item.phone)}
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
          );
        }}
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
  userIcon: {
    backgroundColor: "#B71C1C",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
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
  statusBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
});
