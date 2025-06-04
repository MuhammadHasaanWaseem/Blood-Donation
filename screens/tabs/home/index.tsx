import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import {
  Search,
  User,
  Hospital,
  Stethoscope,
  Droplet,
  HeartHandshake,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();
  const [showDonateModal, setShowDonateModal] = useState(false);

  const handleDonatePress = () => setShowDonateModal(true);
  const handleCloseModal = () => setShowDonateModal(false);

  const handleDonateChoice = (type) => {
    setShowDonateModal(false);
    router.push(type === "hospital" ? "/hospitals" : "/doctors");
  };

  const menuItems = [
    {
      icon: Search,
      color: "#3B82F6",
      title: "Search",
      description: "Find hospitals or doctors nearby",
      route: "/explore",
    },
    {
      icon: User,
      color: "#8B5CF6",
      title: "Profile",
      description: "Manage your personal info",
      route: "/profile",
    },
    {
      icon: Hospital,
      color: "#EF4444",
      title: "Hospitals",
      description: "View nearby facilities",
      route: "/hospitals",
    },
    {
      icon: Stethoscope,
      color: "#10B981",
      title: "Doctors",
      description: "Check expert listings",
      route: "/doctors",
    },
    {
      icon: Droplet,
      color: "#EC4899",
      title: "Donate",
      description: "Register as a blood donor",
      customPress: handleDonatePress,
    },
    {
      icon: HeartHandshake,
      color: "#F59E0B",
      title: "Requests",
      description: "Help people in need",
      route: "/donor",
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FECACA", "#FEE2E2", "#FFFFFF"]}
        style={styles.headerGradient}
      >
        <Text style={styles.header}>Welcome to BloodLink</Text>
        <Text style={styles.subheader}>Your trusted blood donation companion</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardGrid}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() =>
                  item.customPress ? item.customPress() : router.push(item.route)
                }
              >
                <View style={[styles.iconCircle, { borderColor: item.color }]}>
                  <Icon size={28} color={item.color} />
                </View>
                <Text style={[styles.cardTitle, { color: item.color }]}>
                  {item.title}
                </Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Donate Modal */}
      <Modal
        visible={showDonateModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Where do you want to donate?
              </Text>
              <Text style={styles.modalSubtitle}>
                Choose your donation destination
              </Text>
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.hospitalButton]}
                onPress={() => handleDonateChoice("hospital")}
              >
                <Hospital size={24} color="#FFF" />
                <Text style={styles.modalButtonText}>Hospital</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.doctorButton]}
                onPress={() => handleDonateChoice("doctor")}
              >
                <Stethoscope size={24} color="#FFF" />
                <Text style={styles.modalButtonText}>Doctor</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: "900",
    color: "#B91C1C",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subheader: {
    fontSize: 16,
    textAlign: "center",
    color: "#4B5563",
    marginBottom: 10,
    fontWeight: "500",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#FFF",
    width: "48%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    backgroundColor: "#F9FAFB",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000AA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    padding: 20,
  },
  modalButton: {
    flex: 1,
    padding: 22,
    borderRadius: 16,
    marginHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  hospitalButton: {
    backgroundColor: "#EF4444",
  },
  doctorButton: {
    backgroundColor: "#10B981",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 18,
    marginLeft: 10,
  },
  closeButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  closeButtonText: {
    color: "#4B5563",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
});