import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';

const TransferSummaryScreen = ({ route, navigation }: any) => {
  const {
    amount = 200000,
    recipientName = 'Abdul Mustakim',
    recipientId = '+62 12345678910',
    date = 'June 12, 2023',
    time = '20:32',
    referenceId = 'QOIU-0012-ADFE-2234',
    fee = 0,
  } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Card */}
      <View style={styles.card}>
        {/* Checkmark */}
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✔</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Transfer Successful</Text>
        <Text style={styles.subtitle}>Your transaction was successfull</Text>

        {/* Amount */}
        <Text style={styles.amount}>{`Rp ${amount.toLocaleString('id-ID')}`}.000</Text>

        {/* Recipient Info */}
        <View style={styles.profileContainer}>
          <Image
            source={require("../../assets/icon/profile.png")}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>{recipientName}</Text>
            <Text style={styles.profilePhone}>{recipientId}</Text>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{`Rp ${amount.toLocaleString('id-ID')}`}.000</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number</Text>
            <Text style={styles.detailValue}>{referenceId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={styles.detailValue}>{`Rp ${fee.toLocaleString('id-ID')}`}</Text>
          </View>
        </View>

        {/* Total Payment */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Payment</Text>
          <Text style={styles.totalValue}>{`Rp ${(amount + fee).toLocaleString('id-ID')}`}.000</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#800040',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#800040',
    color: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800040',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 5,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  profilePhone: {
    fontSize: 14,
    color: 'gray',
  },
  detailsContainer: {
    width: '100%',
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: 'gray',
  },
  detailValue: {
    fontSize: 14,
    color: 'black',
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800040',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800040',
    marginBottom: 10,
  },
  shareButton: {
    backgroundColor: '#800040',
    borderRadius: 50,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  shareText: {
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    borderColor: '#800040',
    borderWidth: 1,
    borderRadius: 50,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  backText: {
    color: '#800040',
    fontSize: 16,
  },
});

export default TransferSummaryScreen;
