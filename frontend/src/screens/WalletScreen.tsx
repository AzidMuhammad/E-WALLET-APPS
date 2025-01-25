import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WalletScreen = ({navigation}: any ) => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>({
    balance: "0",
    banks: [],
    eWallets: [],
  });

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Error", "User not authenticated");
          setLoading(false);
          return;
        }

        const userResponse = await axios.get("http://172.20.10.4:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = userResponse.data.user.id;

        const walletResponse = await axios.get(
          `http://172.20.10.4:5000/api/wallet/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setWalletData(walletResponse.data);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        Alert.alert("Error", "Failed to fetch wallet data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800040" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#fff" style={styles.headerLogo} onPress={() => navigation?.goBack()} />
        <Text style={styles.headerTitle}>Wallet Card</Text>
        <View style={{ width: 24 }} />
      </View>

      <View>
        {walletData.banks.length > 0 ? (
          walletData.banks.map((bank: any, index: number) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="card-outline" size={20} color="#fff" />
                  <Text style={styles.cardHeaderText}>{bank.name || "Unknown Bank"}</Text>
                </View>
                <Text style={styles.cardTotalLabel}>Balance</Text>
                <Text style={styles.cardTotalAmount}>{walletData.balance || "0"}</Text>
                <Text style={styles.cardNumber}>{bank.accountNumber || "Unknown Account"}</Text>
              </View>
              <View style={styles.cardLogo}>
                <Text style={styles.cardLogoText}>*</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noCardText}>No bank cards available</Text>
        )}
      </View>

      <View>
        {walletData.eWallets.length > 0 ? (
          walletData.eWallets.map((eWallet: any, index: number) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="wallet-outline" size={20} color="#fff" />
                  <Text style={styles.cardHeaderText}>{eWallet.name || "Unknown E-Wallet"}</Text>
                </View>
                <Text style={styles.cardTotalLabel}>Balance</Text>
                <Text style={styles.cardTotalAmount}>{walletData.balance || "0"}</Text>
                <Text style={styles.cardNumber}>{eWallet.accountId || "Unknown ID"}</Text>
              </View>
              <View style={styles.cardLogo}>
                <Text style={styles.cardLogoText}>*</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noCardText}>No e-wallets available</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#800040",
    marginLeft: 18,
  },
  headerLogo: {
    backgroundColor: '#800040',
    padding: 5,
    borderRadius: 10
  },  
  card: {
    backgroundColor: "#800040",
    borderRadius: 25,
    padding: 24,
    marginVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  cardHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  cardTotalLabel: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 4,
  },
  cardTotalAmount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 8,
  },
  cardNumber: {
    color: "#fff",
    fontSize: 16,
    letterSpacing: 2,
    marginTop: 30,
    marginBottom: -6,
  },
  cardLogo: {
    flex: 2,
    alignItems: "flex-end",
  },
  cardLogoText: {
    position: 'absolute',
    bottom: -220,
    fontSize: 300,
    fontWeight: "bold",
    color: "#fff",
  },
  noCardText: {
    color: "#800040",
    textAlign: "center",
    marginVertical: 20,
  },
  informationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#800040",
    textAlign: "center",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#800040",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  textInputStyle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: "#800040",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WalletScreen;
