import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TransactionScreen from '../screens/TransactionsScreen';
import StatisticScreen from '../screens/StatisticScreen';
import ProfileScreen from '../screens/ProfileScreen';

type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Statistic: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface IconSource {
  activeIcon: ImageSourcePropType;
  inactiveIcon: ImageSourcePropType;
}

export default function BottomNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 25, overflow: 'hidden' }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Transactions" component={TransactionScreen} />
        <Tab.Screen name="Statistic" component={StatisticScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const { activeIcon, inactiveIcon } = getIconSource(route.name);

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabButton}
            >
              <Image 
                source={isFocused ? activeIcon : inactiveIcon}
                style={styles.icon}
              />
              <Text style={[styles.label, { color: isFocused ? '#FFFFFF' : '#C0C0C0' }]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const getIconSource = (routeName: string): IconSource => {
  switch (routeName) {
    case 'Home':
      return {
        activeIcon: require('../../assets/icon/home-active.png'),
        inactiveIcon: require('../../assets/icon/home-not.png'),
      };
    case 'Transactions':
      return {
        activeIcon: require('../../assets/icon/transaction-active.png'),
        inactiveIcon: require('../../assets/icon/transaction-not.png'),
      };
    case 'Statistic':
      return {
        activeIcon: require('../../assets/icon/statistic-active.png'),
        inactiveIcon: require('../../assets/icon/statistic-active.png'),
      };
    case 'Profile':
      return {
        activeIcon: require('../../assets/icon/profile-active.png'),
        inactiveIcon: require('../../assets/icon/profile-not.png'),
      };
    default:
      return {
        activeIcon: require('../../assets/icon/home-active.png'),
        inactiveIcon: require('../../assets/icon/home-not.png'),
      };
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    justifyContent: 'center',    
    height: 120,
    alignItems: 'center',
    borderRadius: 30,  
    overflow: 'hidden',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#660033',
    height: 75,
    width: '90%',
    borderRadius: 25,
    position: 'absolute',
    alignSelf: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 5 },
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '300',
  },
});