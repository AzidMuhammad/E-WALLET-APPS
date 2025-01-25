import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface UserData {
  id: string;
  balance: number;
}

const TransferBankScreen = ({ navigation }: any) => {
  const [transactionType, setTransactionType] = useState<string>('BANK');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('Rp.');
  const [notes, setNotes] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.error('User not authenticated');
          return;
        }

        const response = await axios.get('http://172.20.10.4:5000/api/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

const handleTransaction = async () => {
  if (!accountId || !amount || parseInt(amount.replace(/\D/g, '')) <= 0) {
    console.error('Invalid account ID or amount');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.error('User not authenticated');
      return;
    }

    const payload = {
      type: transactionType,
      amount: parseInt(amount.replace(/\D/g, '')),
      description: notes || (transactionType === 'BANK' ? 'Bank Transfer' : 'E-Wallet Transfer'),
      method: 'TRANSFER',
      recipientId: accountId,
    };

    const response = await axios.post(
      `http://172.20.10.4:5000/api/wallet/${userData?.id}/transaction`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      const { transaction } = response.data;

      navigation.navigate('TransferSummary', {
        amount: transaction.amount,
        recipientName: transaction.recipientName || 'Unknown Recipient',
        recipientId: transaction.recipientId,
        transferType: transaction.type === 'BANK' ? 'Bank Transfer' : 'E-Wallet Transfer',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        referenceId: transaction.referenceId,
        fee: transaction.fee || 0,
      });
    } else {
      console.error('Transaction failed:', response.data.message);
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
  }
};


  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()}>
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transfer</Text>
            <TouchableOpacity style={styles.questionButton}>
              <Text style={styles.questionButtonText}>?</Text>
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>{`Rp ${userData?.balance?.toLocaleString('id-ID') || '0'}`}.000</Text>
            <TouchableOpacity style={styles.topUpButton}>
              <Icon name="wallet" size={20} color="#660033" />
              <Text style={styles.topUpText}>Top Up</Text>
            </TouchableOpacity>
          </View>

          {/* Main Form */}
          <View style={styles.formContainer}>
            {/* Transaction Type Input */}
            <View style={styles.transactionTypeContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter BANK or E-WALLET"
                value={transactionType}
                onChangeText={(text) => setTransactionType(text)}
              />
            </View>

            {/* Account ID Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={
                  transactionType === 'BANK' ? 'Enter Bank Account Number' : 'Enter E-Wallet Account ID'
                }
                value={accountId}
                onChangeText={setAccountId}
                keyboardType={transactionType === 'BANK' ? 'number-pad' : 'default'}
              />
            </View>

            {/* Amount Section */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Set Amount</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Rp 0"
                placeholderTextColor="#999"
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
              />
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleTransaction}>
            <Text style={styles.continueButtonText}>Transfer</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  balanceContainer: {
    padding: 20,
    marginBottom: 10,
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
    marginTop: -45,
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
  transactionTypeContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
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
  amountContainer: {
    alignItems: 'center',
    marginBottom: 42,
  },
  amountLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesContainer: {
    marginBottom: 150,
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

export default TransferBankScreen;
