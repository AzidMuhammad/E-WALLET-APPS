import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  Image 
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const EditProfileScreen: React.FC = ({ navigation, route } : any ) => {
  const [name, setName] = useState(route.params.name);
  const [phone, setPhone] = useState(route.params.phone);
  const [isLoading, setIsLoading] = useState(false);

const handleSaveProfile = async () => {
  if (!name.trim()) {
    Alert.alert("Error", "Name cannot be empty");
    return;
  }

  try {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await axios.put(
      "http://172.20.10.4:5000/api/user/profile", 
      { name, phone },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.success) {
      Alert.alert("Success", "Profile updated successfully", [
        { 
          text: "OK", 
          onPress: () => navigation.goBack() 
        }
      ]);
    } else {
      throw new Error(response.data.message || "Update failed");
    }
  } catch (error: any) {
    console.error("Error updating profile:", error);
    Alert.alert(
      "Error", 
      error.response?.data?.message || 
      error.message || 
      "Failed to update profile. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#fff" onPress={() => navigation?.goBack()} />
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/profile/profile-avatar.png")}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#66003380"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            placeholderTextColor="#66003380"
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#660033",
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#660033",
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  changeAvatarButton: {
    backgroundColor: "#660033",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeAvatarText: {
    color: "#fff",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    color: "#660033",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#66003330",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    color: "#660033",
  },
  saveButton: {
    backgroundColor: "#660033",
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfileScreen;