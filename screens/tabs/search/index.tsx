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
  ActivityIndicator
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, MapPin, Star, User, Search, X, Hospital, Stethoscope } from "lucide-react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (text: string) => {
    setQuery(text);
    setError(null);
    
    if (!text.trim()) {
      setHospitals([]);
      setDoctors([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: hospitalData, error: hospitalError } = await supabase
        .from("hospitals")
        .select("*")
        .ilike("name", `%${text}%`);
      
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select("*")
        .ilike("name", `%${text}%`);
      
      if (hospitalError) throw hospitalError;
      if (doctorError) throw doctorError;
      
      setHospitals(hospitalData || []);
      setDoctors(doctorData || []);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setHospitals([]);
    setDoctors([]);
    setError(null);
  };

  const openPhone = (number: string) => Linking.openURL(`tel:${number}`);
  const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Healthcare Providers</Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search hospitals or doctors..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={query}
            onChangeText={search}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B71C1C" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {!loading && !error && hospitals.length === 0 && doctors.length === 0 && query.length > 0 && (
          <View style={styles.emptyContainer}>
            <Search size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>We couldn't find any matches for "{query}"</Text>
          </View>
        )}

        {hospitals.length > 0 && (
          <Text style={styles.sectionHeader}>
            <Hospital size={20} color="#EF4444" /> Hospitals ({hospitals.length})
          </Text>
        )}
        {hospitals.map((hospital) => (
          <View key={hospital.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.hospitalIcon]}>
                <Hospital size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>{hospital.name || "Unknown Hospital"}</Text>
            </View>

            {hospital.location && (
              <View style={styles.infoRow}>
                <MapPin size={18} color="#EF4444" />
                <Text style={styles.infoText}>{hospital.location}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Star size={18} color="#F59E0B" />
              <Text style={styles.infoText}>
                {hospital.rating ? `${hospital.rating}/5` : "No rating"}
                {hospital.reviews && ` · ${hospital.reviews} reviews`}
              </Text>
            </View>

            <View style={styles.contactContainer}>
              {hospital.contactNumber && (
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => openPhone(hospital.contactNumber)}
                >
                  <Phone size={16} color="#3B82F6" />
                  <Text style={styles.contactText}>Call</Text>
                </TouchableOpacity>
              )}
              
              {hospital.email && (
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => openEmail(hospital.email)}
                >
                  <Mail size={16} color="#3B82F6" />
                  <Text style={styles.contactText}>Email</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {doctors.length > 0 && (
          <Text style={styles.sectionHeader}>
            <Stethoscope size={20} color="#8B5CF6" /> Doctors ({doctors.length})
          </Text>
        )}
        {doctors.map((doctor) => (
          <View key={doctor.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.doctorIcon]}>
                <User size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>Dr. {doctor.name || "Unknown Doctor"}</Text>
            </View>

            {doctor.specialization && (
              <View style={styles.infoRow}>
                <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{doctor.specialization}</Text>
                </View>
              </View>
            )}

            {doctor.hospital && (
              <View style={styles.infoRow}>
                <Hospital size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>{doctor.hospital}</Text>
              </View>
            )}

            {doctor.qualification && (
              <Text style={styles.subInfo}>🎓 {doctor.qualification}</Text>
            )}

            {doctor.experience && (
              <Text style={styles.subInfo}>⏳ {doctor.experience} years experience</Text>
            )}

            <View style={styles.contactContainer}>
              {doctor.phone && (
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => openPhone(doctor.phone)}
                >
                  <Phone size={16} color="#3B82F6" />
                  <Text style={styles.contactText}>Call</Text>
                </TouchableOpacity>
              )}
              
              {doctor.email && (
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => openEmail(doctor.email)}
                >
                  <Mail size={16} color="#3B82F6" />
                  <Text style={styles.contactText}>Email</Text>
                </TouchableOpacity>
              )}
            </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    padding: 8,
  },
  scroll: {
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  doctorIcon: {
    backgroundColor: "#8B5CF6",
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
    flexWrap: "wrap",
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
    marginLeft: 2,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#4B5563",
  },
  specialtyBadge: {
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  specialtyText: {
    color: "#8B5CF6",
    fontWeight: "600",
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "500",
  },
});