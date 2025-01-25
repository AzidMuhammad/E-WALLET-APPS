import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

type Cooperative = {
  loans: Loan[];
  name: string;
  dueDate: string;
}

type Loan = {
  _id: string;
  createdAt: string;
  amount: number;
  status: string;
  cooperativeName?: string;
  dueDate?: string;
};

type DateItem = {
  day: string;
  month: string;
  name: string;
  active: boolean;
};

const ScheduleScreen: React.FC = ({navigation} : any) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchCooperativesAndLoans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const userResponse = await axios.get("http://172.20.10.4:5000/api/user/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = userResponse.data?.user?.id;
      if (!userId) {
        throw new Error('Invalid user data received');
      }
      
      setUserData(userResponse.data.user);

      const cooperativesResponse = await axios.get(
        `http://172.20.10.4:5000/api/cooperative/user/${userId}/cooperatives`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cooperatives: Cooperative[] = cooperativesResponse.data;
      
      const allLoans = cooperatives.flatMap((coop: Cooperative) => 
        (coop.loans || []).map((loan: Loan) => ({
          ...loan,
          cooperativeName: coop.name,
          dueDate: coop.dueDate
        }))
      );

      const processedDates = allLoans
        .map((loan: Loan) => {
          if (!loan.dueDate) return null;
          
          const date = new Date(loan.dueDate);
          return {
            day: String(date.getDate()),
            month: monthNames[date.getMonth()],
            name: dateNames[date.getDay()],
            active: false
          };
        })
        .filter((d): d is DateItem => d !== null);

      const uniqueDates = Array.from(
        new Set(processedDates.map(d => `${d.day}-${d.month}`))
      )
        .map((dateStr: string) => {
          const [day, month] = dateStr.split('-');
          const matchingDate = processedDates.find(
            (d: DateItem) => d.day === day && d.month === month
          );
          return matchingDate;
        })
        .filter((d): d is DateItem => d !== undefined);

      if (uniqueDates.length > 0) {
        uniqueDates[0].active = true;
      }

      setDates(uniqueDates);
      setLoans(allLoans);

    } catch (error: any) {

      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
      }
      setError(error.response?.data?.message || error.message);
      console.error("Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCooperativesAndLoans();
  }, []);

  const renderLoan = ({ item }: { item: Loan }) => {
    if (!item.dueDate) return null;
    
    const date = new Date(item.dueDate);
    
    return (
      <View style={styles.eventContainer}>
        <Text style={styles.time}>
          {`${date.getDate()} ${fullMonthNames[date.getMonth()]}`}
        </Text>
        <View style={styles.timelineContainer}>
          <View style={styles.timelineDot} />
          <View style={styles.timeline} />
        </View>
        <View style={styles.eventCard}>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.cooperativeName || 'Unknown Cooperative'}</Text>
            <Text style={styles.eventParticipants}>
              Amount: Rp {item.amount.toLocaleString("id-ID")}.000
            </Text>
          </View>
          <Text style={styles.eventPeriod}>Status: {item.status}</Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800040" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchCooperativesAndLoans}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Icon name="chevron-left" size={28} color="#800040" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="cog" size={24} color="#800040" />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateContainer}>
        {dates.map((date, index) => (
          <View
            key={index}
            style={[
              styles.dateItem,
              date.active && styles.activeDateItem,
            ]}
          >
            <Text style={[styles.dateDay, date.active && styles.activeDateText]}>
              {date.day}
            </Text>
            <Text style={[styles.dateName, date.active && styles.activeDateText]}>
              {date.month}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Ongoing Loans */}
      <Text style={styles.ongoingTitle}>Ongoing</Text>
      <FlatList
        data={loans}
        keyExtractor={(item) => item._id}
        renderItem={renderLoan}
        style={styles.eventList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 44,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#800040',
    marginLeft: 24
  },
  settingsButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#FFF5F8',
    borderRadius: 16,
  },
  dateContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: -350
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 83,
    height: 180,
    marginRight: 14,
    borderRadius: 50,
    backgroundColor: '#fff',
    shadowColor: '#800040',
    shadowOffset: {
      width: 1,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activeDateItem: {
    backgroundColor: '#800040',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  dateDay: {
    fontSize: 26,
    fontWeight: '700',
    color: '#800040',
    marginBottom: 4,
  },
  dateName: {
    fontSize: 16,
    color: '#800040',
    opacity: 0.8,
  },
  dateNameSecondary: {
    fontSize: 12,
    color: '#800040',
    opacity: 0.8,
  },
  activeDateText: {
    color: '#fff',
    opacity: 1,
  },
  ongoingTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  eventContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  time: {
    width: 80,
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 16,
    marginLeft: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#800040',
    marginBottom: 4,
  },
  timeline: {
    width: 2,
    flex: 1,
    backgroundColor: '#800040',
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#800040',
    borderRadius: 24,
    padding: 20,
  },
  eventContent: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  eventParticipants: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  eventPeriod: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#800040',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#800040',
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  eventList: {
    flex: 1,
  },
});

export default ScheduleScreen;