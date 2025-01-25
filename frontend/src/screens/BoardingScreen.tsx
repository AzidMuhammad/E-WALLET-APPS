import React from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity } from 'react-native';

interface BoardingScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

const BoardingScreen: React.FC<BoardingScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('../../assets/bg2.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Logo dan Teks */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>KoPay</Text>
        </View>
      </ImageBackground>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Create new account</Text>
        </TouchableOpacity>
        <Text style={styles.footerText} onPress={() => navigation.navigate('Login')}>Already have an account?</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: -110
  },
  button: {
    backgroundColor: '#660033',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 90,
    marginTop: -20,
    marginBottom: 60,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    color: '#660033',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 50,
    marginTop: -34
  },
});

export default BoardingScreen;
