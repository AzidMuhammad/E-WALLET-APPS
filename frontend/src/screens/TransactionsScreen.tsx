import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const TransferScreen = ({ navigation } : any ) => {
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

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

      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data");
      }
    };

    fetchUserData();
  }, []);

    return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Transfer</Text>
        <TouchableOpacity style={styles.questionButton}>
          <Text style={styles.questionButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content with White Background */}
      <View style={styles.mainContent}>
        {/* Transfer Options */}
        <View style={styles.transferOptions}>
          <TouchableOpacity style={styles.transferOption} onPress={() => navigation.navigate('TransferBank')}>
            <Image
              source={require('../../assets/profile/friends-icon.png')}
              style={styles.optionIcon}
            />
            <Text style={styles.transferOptionText}>Transfer to Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.transferOption} onPress={() => navigation.navigate('TransferBank')}>
            <Image
              source={require('../../assets/profile/bank-icon.png')}
              style={styles.optionIcon}
            />
            <Text style={styles.transferOptionText}>Transfer to Bank</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Transfers */}
        <View style={styles.latestTransfers}>
          <Text style={styles.sectionTitle}>Latest Transfer</Text>

          {/* Transfer Items */}
          {transactions.map((item, index) => (
            <TouchableOpacity style={styles.transferItem} key={index}>
              <Image source={require("../../assets/icon/profile.png")} style={styles.avatar} />
              <View style={styles.transferDetails}>
                <Text style={styles.transferName}>{item.recipientName || "Unknown"}</Text>
                <Text style={styles.transferDate}>{new Date(item.createdAt).toLocaleDateString("id-ID")}</Text>
              </View>
              <Text style={styles.transferAmount}>{item.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#660033',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 50,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  questionButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionButtonText: {
    color: '#660033',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
  },
  transferOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  transferOption: {
    backgroundColor: '#660033',
    borderRadius: 15,
    padding: 25,
    width: '48%',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    tintColor: '#fff',
    marginBottom: 14,
  },
  transferOptionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  latestTransfers: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingBottom: 30
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  transferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 25,
    marginRight: 15,
  },
  transferDetails: {
    flex: 1,
  },
  transferName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  transferDate: {
    fontSize: 14,
    color: '#888',
  },
  transferAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default TransferScreen;