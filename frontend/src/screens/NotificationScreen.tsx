import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  recipientName?: string;
}

const NotificationScreen = ({navigation} : any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Error", "User not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://172.20.10.4:5000/api/notification", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;

        if (notifications.length < data.length) {
          const newNotif = data.find((notif: Notification) => !notifications.some((n) => n._id === notif._id));
          if (newNotif) {
            setNewNotification(newNotif.message);
            setTimeout(() => setNewNotification(null), 5000);
          }
        }

        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        Alert.alert("Error", "Failed to fetch notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [notifications]);

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      await Promise.all(
        notifications.map(async (notification) => {
          if (!notification.read) {
            await axios.patch(
              `http://172.20.10.4:5000/api/notification/${notification._id}/read`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
        })
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      Alert.alert("Success", "All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      Alert.alert("Error", "Failed to mark notifications as read. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#660033" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Alert for new notifications */}
      {newNotification ? (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>{newNotification}</Text>
        </View>
      ) : null}

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#fff" onPress={() => navigation?.goBack()} />
        <Text style={styles.headerTitle}>Notification</Text>
        <Ionicons name="settings-outline" size={24} color="#fff" />
      </View>

      {/* Notifications */}
      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAsRead}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {notifications.length === 0 ? (
          <Text style={styles.noNotifications}>No notifications available</Text>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification._id}
              style={[
                styles.notificationCard,
                { backgroundColor: notification.read ? "#fff" : "#F5E4EA" },
              ]}
            >
              <View style={[styles.notificationIcon, { backgroundColor: "#660033" }]}>
                <Ionicons name="notifications-outline" size={24} color="#F5E4EA" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.message}</Text>
                {notification.recipientName && (
                  <Text style={styles.notificationSubtitle}>Recipient: {notification.recipientName}</Text>
                )}
                <Text style={styles.notificationTime}>
                  {new Date(notification.createdAt).toLocaleString("id-ID")}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#660033",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 80,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  alertContainer: {
    position: "absolute",
    bottom: 750,
    left: 20,
    right: 20,
    backgroundColor: "#F5E4EA",
    padding: 30,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  alertText: {
    color: "#660033",
    textAlign: "center",
    fontWeight: "bold",
  },
  content: {
    backgroundColor: "#fff",
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#333",
    fontSize: 16,
  },
  markAsRead: {
    color: "#800040",
    fontSize: 14,
    fontWeight: "500",
  },
  noNotifications: {
    fontSize: 16,
    textAlign: "center",
    color: "#999",
    marginVertical: 20,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#F5E4EA",
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  notificationSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default NotificationScreen;
