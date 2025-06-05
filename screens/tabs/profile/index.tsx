import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { LogOut, Pencil, User, FileText, Calendar, Heart, Clipboard, Clock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from "react-native";

export default function ProfileScreen() {
  const { height } = useWindowDimensions();
  const headerHeight = height * 0.4;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    cnic: "",
    blood_group: "",
    age: "",
    medical_history: "",
  });

  const fetchUserProfile = async () => {
    try {
      const session = supabase.auth.session();
      if (!session) {
        setErrorMsg("User not logged in.");
        setLoading(false);
        return;
      }

      const user = session.user;
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setErrorMsg("Profile not found.");
      } else {
        setProfile(data);
      }
    } catch {
      setErrorMsg("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const openEditModal = () => {
    if (!profile) {
      Alert.alert("Profile not loaded", "Cannot edit profile now.");
      return;
    }
    setForm({
      name: profile.name || "",
      cnic: profile.cnic || "",
      blood_group: profile.blood_group || "",
      age: profile.age ? String(profile.age) : "",
      medical_history: profile.medical_history || "",
    });
    setEditModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const session = supabase.auth.session();
      if (!session) {
        setErrorMsg("User not logged in.");
        setLoading(false);
        setEditModalVisible(false);
        return;
      }
      const user = session.user;

      const updates = {
        name: form.name.trim(),
        cnic: form.cnic.trim(),
        blood_group: form.blood_group.trim(),
        age: Number(form.age),
        medical_history: form.medical_history.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("registrations")
        .update(updates)
        .eq("user_id", user.id);

      if (error) {
        Alert.alert("Update failed", error.message);
      } else {
        Alert.alert("Profile updated");
        setEditModalVisible(false);
        fetchUserProfile();
      }
    } catch {
      Alert.alert("Unexpected error", "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Logout Error", error.message);
      } else {
        router.replace("/signin");
      }
    } catch (e) {
      Alert.alert("Unexpected Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  const fieldIcons = {
    name: <User color="#B71C1C" size={24} />,
    cnic: <FileText color="#B71C1C" size={24} />,
    age: <Calendar color="#B71C1C" size={24} />,
    blood_group: <Heart color="#B71C1C" size={24} />,
    medical_history: <Clipboard color="#B71C1C" size={24} />,
  };

  return (
    <>
      <View style={[styles.header, { height: '35%' ,borderRadius:40}]}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/images/user-icon.png")}
            style={styles.profileImage}
          />
          <Text style={styles.headerTitle}>{profile?.name || "My Profile"}</Text>
          <Text style={styles.headerSubtitle}>Joined {profile?.created_at
      ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
      : "-"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut color="#B71C1C" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {["name", "cnic", "age"].map((field) => (
            <View key={field} style={styles.profileCard}>
              <View style={styles.cardRow}>
                {fieldIcons[field]}
                <View style={styles.cardText}>
                  <Text style={styles.cardLabel}>
                    {field.replace("_", " ").toUpperCase()}
                  </Text>
                  <Text style={styles.cardValue}>{profile[field] || "-"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          {["blood_group", "medical_history"].map((field) => (
            <View key={field} style={styles.profileCard}>
              <View style={styles.cardRow}>
                {fieldIcons[field]}
                <View style={styles.cardText}>
                  <Text style={styles.cardLabel}>
                    {field.replace("_", " ").toUpperCase()}
                  </Text>
                  <Text style={styles.cardValue}>{profile[field] || "-"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.cardRow}>
              <Clock color="#B71C1C" size={24} />
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>LAST UPDATED</Text>
                <Text style={styles.cardValue}>
                  {profile.updated_at
                    ? new Date(profile.updated_at).toLocaleString()
                    : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openEditModal}>
        <Pencil color="#fff" size={22} />
      </TouchableOpacity>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <ScrollView>
              {["name", "cnic", "blood_group", "age", "medical_history"].map(
                (field) => (
                  <View key={field} style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>
                      {field.replace("_", " ").toUpperCase()}
                    </Text>
                    <TextInput
                      value={form[field]}
                      onChangeText={(text) => handleInputChange(field, text)}
                      style={styles.input}
                      keyboardType={field === "age" ? "numeric" : "default"}
                      multiline={field === "medical_history"}
                    />
                  </View>
                )
              )}
            </ScrollView>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  header: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  headerLeft: {
    flexDirection: "column",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 5,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#B71C1C",
  },
  errorText: {
    color: "#B71C1C",
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B71C1C",
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: "#FFF",
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderColor: "#B71C1C",
    borderWidth: 1,
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardText: {
    marginLeft: 10,
  },
  cardLabel: {
    color: "#B71C1C",
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 16,
    color: "#333",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#B71C1C",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#B71C1C",
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 15,
  },
  inputLabel: {
    fontWeight: "600",
    color: "#B71C1C",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#EEE",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#B71C1C",
    padding: 14,
    borderRadius: 10,
    flex: 1,
  },
  cancelText: {
    textAlign: "center",
    color: "#333",
    fontWeight: "600",
  },
  saveText: {
    textAlign: "center",
    color: "#FFF",
    fontWeight: "600",
  },
});