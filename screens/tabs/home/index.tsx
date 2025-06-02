import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
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

export default function HomeScreen() {
  const router = useRouter();
  const [showDonateModal, setShowDonateModal] = useState(false);

  const handleDonatePress = () => {
    setShowDonateModal(true);
  };

  const handleCloseModal = () => {
    setShowDonateModal(false);
  };

  const handleDonateChoice = (type) => {
    setShowDonateModal(false);
    if (type === "hospital") {
      router.push("/hospitals");
    } else if (type === "doctor") {
      router.push("/doctors");
    }
  };

  const menuItems = [
    {
      icon: Search,
      color: "#1E88E5",
      title: "Search",
      description: "Find hospitals or doctors nearby",
      route: "/explore",
    },
    {
      icon: User,
      color: "#6A1B9A",
      title: "Profile",
      description: "Manage your personal info",
      route: "/profile",
    },
    {
      icon: Hospital,
      color: "#D32F2F",
      title: "Hospitals",
      description: "View nearby facilities",
      route: "/hospitals",
    },
    {
      icon: Stethoscope,
      color: "#2E7D32",
      title: "Doctors",
      description: "Check expert listings",
      route: "/doctors",
    },
    {
      icon: Droplet,
      color: "#C62828",
      title: "Donate",
      description: "Register as a blood donor",
      customPress: handleDonatePress,
    },
    {
      icon: HeartHandshake,
      color: "#AD1457",
      title: "Requests",
      description: "Help people in need",
      route: "/donor",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to BloodLink</Text>
      <Text style={styles.subheader}>Your trusted blood donation companion</Text>

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
                <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
                  <Icon size={28} color={item.color} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
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
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Where do you want to donate your blood?</Text>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
              onPress={() => handleDonateChoice("hospital")}
            >
              <Text style={styles.modalButtonText}>Hospital</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#2E7D32" }]}
              onPress={() => handleDonateChoice("doctor")}
            >
              <Text style={styles.modalButtonText}>Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: "#FDECEC",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    color: "#B71C1C",
    textAlign: "center",
    marginBottom: 6,
  },
  subheader: {
    fontSize: 15,
    textAlign: "center",
    color: "#444",
    marginBottom: 22,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#555",
    textAlign: "center",
    fontSize: 14,
  },
});
