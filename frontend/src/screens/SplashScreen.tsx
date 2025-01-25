import React, {useEffect} from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Landing: undefined;
};

const SplashScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        setTimeout(() => {
        navigation.navigate('Landing');
    }, 1000);
    }, [navigation]);

    return (
        <ImageBackground
            source={require('../../assets/bg.png')}
            style={styles.background}
        >
        <View style={styles.container}>
            <ImageBackground
                style={styles.logo}
                source={require('../../assets/logo.png')}
                resizeMode="contain"
            />
        </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
    },
});

export default SplashScreen;
