import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type Page = {
  id: string;
  image: any;
  title: string;
  description: string;
};

const pages: Page[] = [
  {
    id: '1',
    image: require('../../assets/images/landing1.png'),
    title: 'Add all account & manage',
    description: 'You can add all account in one place and use it to send and request.',
  },
  {
    id: '2',
    image: require('../../assets/images/landing2.png'),
    title: 'Track your activity',
    description: 'You can track your income, expense activities and all statistics.',
  },
  {
    id: '3',
    image: require('../../assets/images/landing3.png'),
    title: 'Send & request payments',
    description: 'You can send or recieve any payments from your account.',
  },
];

interface LandingScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (currentIndex < pages.length - 1) {
      const timer = setTimeout(() => setCurrentIndex(currentIndex + 1), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const renderItem = ({ item }: { item: Page }) => (
    <View style={styles.pageContainer}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentOffset={{ x: currentIndex * width, y: 0 }}
      />
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
        {currentIndex === pages.length - 1 && (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Boarding')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginTop: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
  },
  footer: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 64,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 60,
  },
  indicator: {
    width: 30,
    height: 7,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#660033',
  },
  getStartedButton: {
    backgroundColor: '#660033',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 120,
  },
  getStartedText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LandingScreen;
