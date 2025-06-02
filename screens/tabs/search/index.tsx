import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, MapPin, Star, User } from "lucide-react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const search = async (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setHospitals([]);
      setDoctors([]);
      return;
    }

    const { data: hospitalData } = await supabase
      .from("hospitals")
      .select("*")
      .ilike("name", `%${text}%`);

    const { data: doctorData } = await supabase
      .from("doctors")
      .select("*")
      .ilike("name", `%${text}%`);

    setHospitals(hospitalData || []);
    setDoctors(doctorData || []);
  };

  const openPhone = (number: string) => Linking.openURL(`tel:${number}`);
  const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>
      <TextInput
        placeholder="Search hospitals or doctors..."
        placeholderTextColor="#9CA3AF"
        style={styles.searchInput}
        value={query}
        onChangeText={search}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {hospitals.length === 0 && doctors.length === 0 && query.length > 0 && (
          <Text style={styles.emptyText}>No results found for "{query}"</Text>
        )}

        {hospitals.length > 0 && (
          <Text style={styles.sectionHeader}>🏥 Hospitals</Text>
        )}
        {hospitals.map((hospital) => (
          <View key={hospital.id} style={styles.card}>
            <Text style={styles.cardTitle}>{hospital.name}</Text>

            <View style={styles.infoRow}>
              <MapPin size={18} color="#B71C1C" />
              <Text style={styles.infoText}>{hospital.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Phone size={18} color="#B71C1C" />
              <TouchableOpacity onPress={() => openPhone(hospital.contactNumber)}>
                <Text style={styles.linkText}>{hospital.contactNumber}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Mail size={18} color="#B71C1C" />
              <TouchableOpacity onPress={() => openEmail(hospital.email)}>
                <Text style={styles.linkText}>{hospital.email}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Star size={18} color="#FFD700" />
              <Text style={styles.infoText}>{hospital.rating}/5</Text>
            </View>
          </View>
        ))}

        {doctors.length > 0 && (
          <Text style={styles.sectionHeader}>🩺 Doctors</Text>
        )}
        {doctors.map((doctor) => (
          <View key={doctor.id} style={styles.card}>
            <Text style={styles.cardTitle}>{doctor.name}</Text>

            <View style={styles.infoRow}>
              <User size={18} color="#4A148C" />
              <Text style={styles.infoText}>{doctor.specialization}</Text>
            </View>

            <Text style={styles.subInfo}>🏥 {doctor.hospital}</Text>
            <Text style={styles.subInfo}>Experience: {doctor.experience} years</Text>

            <TouchableOpacity onPress={() => openPhone(doctor.phone)} style={{ marginTop: 8 }}>
              <Text style={styles.linkText}>📞 {doctor.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openEmail(doctor.email)}>
              <Text style={styles.linkText}>✉️ {doctor.email}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#B71C1C",
    marginBottom: 12,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
    marginBottom: 24,
  },
  scroll: {
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  subInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  linkText: {
    fontSize: 14,
    color: "#B71C1C",
    marginLeft: 8,
    textDecorationLine: "underline",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 40,
  },
});
