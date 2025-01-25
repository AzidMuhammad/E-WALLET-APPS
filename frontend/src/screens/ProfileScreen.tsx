import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert,
  Clipboard 
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({navigation} : any) => {
  const [userData, setUserData] = useState({
    id: "",
    name: "Unknown",
    phone: "Unknown",
    contactsCount: 0,
    cardsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Error", "User not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://172.20.10.4:5000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { id, name, phone, contactsCount, cardsCount } = response.data.user;

        setUserData({
          id: id || "",
          name: name || "Unknown",
          phone: phone || "Unknown",
          contactsCount: contactsCount || 0,
          cardsCount: cardsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchUserData);
    fetchUserData();
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: handleLogout 
        }
      ]
    );
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile', {
      name: userData.name,
      phone: userData.phone
    });
  };

  const handleShare = () => {
    // Copy user ID to clipboard
    Clipboard.setString(userData.id);
    Alert.alert("Share", "User ID copied to clipboard");
  };

  const handleSwitch = () => {
    // Implement switch account logic
    Alert.alert(
      "Switch Account", 
      "This feature is not yet implemented.", 
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#660033" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.content}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={require("../../assets/profile/profile-avatar.png")}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.phoneNumber}>{userData.phone}</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={navigateToEditProfile}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Image
                source={require("../../assets/profile/share-icon.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSwitch}
            >
              <Image
                source={require("../../assets/profile/switch-icon.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Switch</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={confirmLogout}
            >
              <Image
                source={require("../../assets/profile/logout-icon.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Log out</Text>
            </TouchableOpacity>
          </View>

          {/* Rest of the code remains the same */}
          {/* Menu Items section */}
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Image
                  source={require("../../assets/profile/contact-icon.png")}
                  style={styles.menuIcon}
                />
                <View style={styles.subMenuItemLeft}>
                  <Text style={styles.menuText}>Contacts</Text>
                  <Text style={styles.menuCount}>{userData.contactsCount} Contacts</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <Image
                  source={require("../../assets/profile/chevron-right.png")}
                  style={styles.chevron}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('Wallet')}
            >
              <View style={styles.menuItemLeft}>
                <Image
                  source={require("../../assets/profile/card-icon.png")}
                  style={styles.menuIcon}
                />
                <View style={styles.subMenuItemLeft}>
                    <Text style={styles.menuText}>Cards</Text>
                    <Text style={styles.menuCount}>{userData.cardsCount} Cards</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <Image
                  source={require("../../assets/profile/chevron-right.png")}
                  style={styles.chevron}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('Schedule')}
            >
              <View style={styles.menuItemLeft}>
                <Image
                  source={require("../../assets/profile/schedule-icon.png")}
                  style={styles.menuIcon}
                />
                <View style={styles.subMenuItemLeft}>
                  <Text style={styles.menuText}>Schedule</Text>
                  <Text style={styles.menuSubtext}>Payment Schedule</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <Image
                  source={require("../../assets/profile/chevron-right.png")}
                  style={styles.chevron}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: "95%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
  },
  content: {
    backgroundColor: "#660033",
    borderRadius: 30,
    marginTop: 100,
    height: 620,
    padding: 22,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -64,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: "#FFFFFF80",
    marginBottom: 12,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#751A48",
    borderRadius: 30,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 36,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    width: 28,
    height: 28,
    marginBottom: 8,
    tintColor: "#FFFFFF",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  menuItems: {
    borderRadius: 15,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#751A48",
    padding: 18,
    marginBottom: 20,
    borderRadius: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  subMenuItemLeft: {
    flexDirection: "column",
  },
  menuIcon: {
    width: 50,
    height: 50,
    marginRight: 14,
    padding: 12,
    backgroundColor: "#660033",
    borderRadius: 10,
    tintColor: "#FFFFFF",
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuCount: {
    color: "#FFFFFF80",
    fontSize: 14,
    marginRight: 8,
    marginTop: 4,
  },
  menuSubtext: {
    color: "#FFFFFF80",
    fontSize: 14,
    marginRight: 8,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: "#FFFFFF80",
  },
});

export default ProfileScreen;