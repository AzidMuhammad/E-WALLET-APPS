import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/LandingScreen';
import BoardingScreen from '../screens/BoardingScreen';
import LoginScreen from '../screens/AuthScreen/LoginScreen';
import RegisterScreen from '../screens/AuthScreen/RegisterScreen';
import BottomNavigator from './BottomNavigator';
import TransferBankScreen from '../screens/TransferBankScreen';
import TopUpScreen from '../screens/TopUpScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import NotificationScreen from '../screens/NotificationScreen';
import WalletScreen from '../screens/WalletScreen';
import TransferSummaryScreen from '../screens/TransferSummaryScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

export type StackParamList = {
    Splash: undefined;
    Landing: undefined;
    Boarding: undefined;
    Login: undefined;
    Register: undefined;
    TransferBank: undefined;
    TopUp: undefined;
    Withdraw: undefined;
    Notification: undefined;
    Wallet: undefined;
    TransferSummary: undefined;
    Schedule: undefined;
    EditProfile: undefined;
    Main: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Boarding" component={BoardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="TransferBank" component={TransferBankScreen} />
            <Stack.Screen name="TopUp" component={TopUpScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="TransferSummary" component={TransferSummaryScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />

            <Stack.Screen name="Main" component={BottomNavigator} />
        </Stack.Navigator>
    );
}
