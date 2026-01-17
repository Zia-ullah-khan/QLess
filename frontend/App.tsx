import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { CartProvider } from './src/context/CartContext';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import StoreSelectScreen from './src/screens/StoreSelectScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import CartScreen from './src/screens/CartScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import QRCodeScreen from './src/screens/QRCodeScreen';

export type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  QRCode: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <CartProvider>
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
              <Stack.Screen name="StoreSelect" component={StoreSelectScreen} />
              <Stack.Screen name="Scanner" component={ScannerScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="QRCode" component={QRCodeScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
