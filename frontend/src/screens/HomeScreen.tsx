import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const HomeScreen: React.FC = ({navigation}: any) => {
  const [isBalanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Error", "User not authenticated");
          return;
        }

        const response = await axios.get("http://172.20.10.4:5000/api/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched Cooperative Groups:", response.data.user.cooperativeGroups);
        setUserData(response.data.user);

        const transactionResponse = await axios.get(
          `http://172.20.10.4:5000/api/wallet/${response.data.user.id}/transactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTransactions(transactionResponse.data);
          const notificationResponse = await axios.get("http://172.20.10.4:5000/api/notification", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const unread = notificationResponse.data.filter((notif: any) => !notif.read).length;
        setUnreadCount(unread);

      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#660033" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", fontSize: 16 }}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require("../../assets/logo.png")} style={styles.logoImage} />
          <Text style={styles.logo}>KoPay</Text>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notification")}>
            <Icon name="bell-outline" color="white" size={24} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>
            {isBalanceVisible ? `Rp ${userData?.balance?.toLocaleString("id-ID") || "0"}` : "••••••"}.000
          </Text>
          <TouchableOpacity onPress={() => setBalanceVisible(!isBalanceVisible)}>
            <Icon
              name={isBalanceVisible ? "eye-off-outline" : "eye-outline"}
              color="white"
              size={20}
            />
          </TouchableOpacity>
        </View>
      </View>

    <View style={styles.menuContainer}>
      {[
        { icon: "swap-horizontal", label: "Transfer", screen: "Transactions" },
        { icon: "wallet-plus", label: "Top Up", screen: "TopUp" },
        { icon: "cash-minus", label: "Withdraw", screen: "Withdraw" },
        { icon: "dots-horizontal", label: "More", screen: "Transactions" },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuButton}
          onPress={() => navigation.navigate(item.screen as never)}
        >
          <View style={styles.menuIconContainer}>
            <Icon name={item.icon} size={28} color="#660033" />
          </View>
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Transactions')}>
            <View style={styles.addAvatar}>
              <Text style={styles.addIcon}>+</Text>
            </View>
            <Text style={styles.avatarName}>Add New</Text>
          </TouchableOpacity>
          {transactions.map((transaction, index) => (
            <TouchableOpacity key={index} style={styles.avatarContainer}>
              <Image
                source={require("../../assets/icon/profile.png")}
                style={styles.avatar}
              />
              <Text style={styles.avatarName}>{transaction.recipientName || "Unknown"}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Statistic')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionList}>
          {transactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Icon name={"bank"} size={28} color="#660033" />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <Text style={styles.transactionAmount}>
                {transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cooperativeContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cooperative Preview</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bentoGrid}>
          {userData?.cooperativeGroups?.length > 0 ? (
            userData.cooperativeGroups.map((group: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.bentoBox,
                  index === 2 && styles.wideBox,
                  index === 1 && styles.tallBox,
                ]}
              >
                <View style={styles.iconWrapper}>
                  <Icon name="account-group" size={32} color="#660033" />
                </View>
                <Text style={styles.cooperativeNumber}>
                  Loans:{" "}
                  {group.loans
                    .filter((loan: any) => loan.userId === userData.id)
                    .reduce((total: number, loan: any) => total + loan.amount, 0)
                    .toLocaleString("id-ID")}.000
                </Text>
                <Text style={styles.cooperativeLabel}>{group.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noCooperativeText}>No cooperative groups found.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: 'rgb(102,0,51)',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 25,
    height: 25,
    marginRight: -235
  },
  notificationButton: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  balanceContainer: {
    backgroundColor: '#660033',
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
    fontWeight: '600'
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 6,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    alignItems: 'center',
  },
  menuIconContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 50,
    padding: 12,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#660033',
    fontWeight: '600'
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 24,
    marginLeft: 6
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  avatarName: {
    fontSize: 12,
    marginTop: 8,
    color: '#000',
    fontWeight: '600'
  },
  addAvatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#660033',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 28,
    color: '#660033',
  },
  transactionList: {
    backgroundColor: '#FFFFFF',
    marginTop: -8
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    backgroundColor: '#F8F8F8',
    borderRadius: 50,
    padding: 10,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 4
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E8E',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    color: '#660033',
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#009900',
  },
  cooperativeContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  bentoBox: {
    borderColor: "#660033",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    width: "48%",
    aspectRatio: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  wideBox: {
    width: "48%",
    aspectRatio: 1.5,
  },
  tallBox: {
    width: "48%",
    aspectRatio: 1.5,
  },
  iconWrapper: {
    borderRadius: 50,
    padding: 10,
    marginBottom: 10,
  },
  cooperativeNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#660033",
    textAlign: "center",
    marginBottom: 8,
  },
  cooperativeLabel: {
    fontSize: 14,
    color: "#660033",
    textAlign: "center",
    fontWeight: "600",
  },
  noCooperativeText: {
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 14,
  },
});

export default HomeScreen;