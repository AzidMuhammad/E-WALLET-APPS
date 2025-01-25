import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WithdrawScreenProps {
  navigation?: any;
}

const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [balance, setBalance] = useState(0);

  // Fetch current balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          throw new Error("User not authenticated");
        }

        const userResponse = await axios.get("http://172.20.10.4:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = userResponse.data.user.id;

        const walletResponse = await axios.get(`http://172.20.10.4:5000/api/wallet/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove 'Rp' and '.000', then parse
        const currentBalance = parseInt(
          walletResponse.data.balance.replace(/[^0-9]/g, '')
        );
        setBalance(currentBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        Alert.alert("Error", "Failed to fetch balance");
      }
    };

    fetchBalance();
  }, []);

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');

    if (numericValue) {
      const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(parseInt(numericValue));
      
      setAmount(formattedAmount);
    } else {
      setAmount('Rp 0');
    }
  };

  const handleContinue = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Extract numeric value
    const extractedAmount = parseInt(amount.replace(/[^0-9]/g, ''));
    
    // Validate amount
    if (extractedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (extractedAmount > balance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    try {
      // Get user token
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("User not authenticated");
      }

      // Get user ID from token
      const userResponse = await axios.get("http://172.20.10.4:5000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = userResponse.data.user.id;

      // Perform withdrawal transaction
      const withdrawResponse = await axios.post(
        `http://172.20.10.4:5000/api/wallet/${userId}/withdraw`, 
        {
          amount: extractedAmount,
          description: notes || "Withdraw"
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Show success message
      Alert.alert(
        "Withdrawal Successful", 
        `Rp ${extractedAmount.toLocaleString('id-ID')}.000 has been withdrawn from your wallet`,
        [{ 
          text: "OK", 
          onPress: () => navigation?.navigate('Wallet') 
        }]
      );
    } catch (error: any) {
      console.error("Withdraw Error:", error.response?.data);
      Alert.alert(
        "Error", 
        error.response?.data?.message || 
        "Failed to withdraw. Please try again."
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw from Wallet</Text>
          <TouchableOpacity style={styles.questionButton}>
            <Text style={styles.questionButtonText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(balance)}
          </Text>
          <TouchableOpacity 
            style={styles.topUpButton} 
            onPress={() => navigation?.navigate('TopUp')}
          >
            <Icon name="wallet" size={20} color="#660033" />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* Main Form */}
        <View style={styles.formContainer}>
          {/* Amount Section */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Set Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="Rp 0"
              placeholderTextColor="#999"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Write your notes here"
              value={notes}
              onChangeText={setNotes}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#660033',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
  },
  balanceContainer: {
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 6,
    marginBottom: -40
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
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  topUpText: {
    color: '#660033',
    marginLeft: 8,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 26,
    marginBottom: -120
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 42,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    fontSize: 16,
    paddingVertical: 20,
  },
  contactButton: {
    marginLeft: 16,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 42,
  },
  amountLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    height: 150,
    textAlignVertical: 'top',
  },
  continueButton: {
    backgroundColor: '#660033',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WithdrawScreen;
