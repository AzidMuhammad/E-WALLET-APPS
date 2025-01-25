import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup } from 'victory-native';
import { Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

interface Transaction {
  id: string;
  type: 'E-WALLET' | 'BANK';
  amount: number;
  description: string;
  createdAt: string;
  recipientId?: string;
}

export default function StatisticScreen() {
  const [summary, setSummary] = useState<{ income: number; expense: number }>({ income: 0, expense: 0 });
  const [chartData, setChartData] = useState<{ x: string; income: number; expense: number }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          console.error('User is not authenticated');
          return;
        }

        const response = await axios.get<{ balance: number; transactions: Transaction[] }>(
          `http://172.20.10.4:5000/api/statistics/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { balance, transactions } = response.data;

        setSummary({
          income: balance,
          expense: transactions.reduce((acc: number, tx: Transaction) => acc + tx.amount, 0),
        });

        setChartData(
          transactions.map((tx: Transaction) => ({
            x: tx.createdAt,
            income: tx.type === 'E-WALLET' ? tx.amount : 0,
            expense: tx.type === 'BANK' ? tx.amount : 0,
          }))
        );

        setTransactions(transactions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Statistic</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.summaryBox}>
          <View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>
              {summary.income.toLocaleString('id-ID', {})}.000
            </Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={styles.summaryAmount}>
              {summary.expense.toLocaleString('id-ID', {})}.000
            </Text>
          </View>
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendLabel}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: '#FFA726' }]} />
            <Text style={styles.legendLabel}>Expense</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <VictoryChart
            width={screenWidth}
            height={300}
            padding={{ top: 30, bottom: 50, left: 40, right: 40 }}
            domainPadding={{ x: 20 }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: '#fff' },
                tickLabels: { fill: '#fff', fontSize: 12, fontWeight: '500' },
              }}
            />
            <VictoryGroup offset={15}>
              <VictoryBar
                data={chartData}
                x="x"
                y="income"
                barWidth={10}
                cornerRadius={{ top: 5, bottom: 5 }}
                style={{
                  data: { fill: "#4CAF50", stroke: "#388E3C", strokeWidth: 1 },
                }}
              />
              <VictoryBar
                data={chartData}
                x="x"
                y="expense"
                barWidth={10}
                cornerRadius={{ top: 5, bottom: 5 }}
                style={{
                  data: { fill: "#FFA726", stroke: "#F57C00", strokeWidth: 1 },
                }}
              />
            </VictoryGroup>
          </VictoryChart>
        </View>

        <View style={styles.transactions}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={[styles.merchantLogo, { backgroundColor: tx.type === 'BANK' ? '#006241' : '#E50914' }]}>
                <Ionicons
                  name={tx.type === 'BANK' ? 'cash-outline' : 'wallet-outline'}
                  size={24}
                  color="#fff"
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.merchantName}>{tx.type}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: tx.type === 'BANK' ? '#E50914' : '#4CAF50' }
                ]}
              >
                {`${tx.type === 'BANK' ? '-' : '+'} ${tx.amount.toLocaleString('id-ID', {})}`}.000
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    fontSize: 24,
    color: '#660033',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#660033',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  summaryBox: {
    backgroundColor: '#660033',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: -20,
    marginBottom: -30,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  legendIcon: {
    width: 8,
    height: 8,
    borderRadius: 50,
  },
  legendLabel: {
    fontSize: 12,
    color: '#660033',
  },
  transactions: {
    padding: 20,
    gap: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  merchantLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#660033',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
