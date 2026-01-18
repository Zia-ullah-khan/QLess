import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { CartProvider } from './src/context/CartContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import StoreSelectScreen from './src/screens/StoreSelectScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import CartScreen from './src/screens/CartScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentErrorScreen from './src/screens/PaymentErrorScreen';
import QRCodeScreen from './src/screens/QRCodeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LiquidTestScreen from './src/screens/LiquidTestScreen';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  AdminLogin: undefined;
  AdminPanel: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  PaymentError: { message: string };
  QRCode: { qrCode: string; transactionId: string };
  LiquidTest: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <SafeAreaProvider>
          <CartProvider>
            <StripeProvider publishableKey={STRIPE_KEY} merchantIdentifier="merchant.com.nexhacks.qless">
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#FAFBFC' },
                    cardStyleInterpolator: ({ current, layouts }) => ({
                      cardStyle: {
                        transform: [
                          {
                            translateX: current.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [layouts.screen.width, 0],
                            }),
                          },
                        ],
                        opacity: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    }),
                  }}
                >
                  <Stack.Screen name="Landing" component={LandingScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="StoreSelect" component={StoreSelectScreen} />
                  <Stack.Screen name="Scanner" component={ScannerScreen} />
                  <Stack.Screen name="Cart" component={CartScreen} />
                  <Stack.Screen name="Payment" component={PaymentScreen} />
                  <Stack.Screen name="PaymentError" component={PaymentErrorScreen} />
                  <Stack.Screen name="QRCode" component={QRCodeScreen} />
                  <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
                  <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
                  <Stack.Screen name="LiquidTest" component={LiquidTestScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </StripeProvider>
          </CartProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
