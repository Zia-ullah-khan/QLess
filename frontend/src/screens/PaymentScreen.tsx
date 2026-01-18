import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { processCheckout } from '../services/api';
import { typography } from '../theme/typography';
import {
  liquidGlassColors,
  liquidShadow,
  squircle,
  liquidBlur,
  getVibrantText,
  glassColors,
  glassShadow,
  radius,
} from '../theme/glass';
import { useStripe } from '@stripe/stripe-react-native';
import GlassSlider from '../components/GlassSlider';
import LiquidGlassContainer from '../components/LiquidGlassContainer';

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  PaymentError: { message: string };
  QRCode: { qrCode: string; transactionId: string };
};

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
}

const PaymentScreen: React.FC<Props> = ({ navigation }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { selectedStore, cartItems, getTotal, setTransactionId, setQrCode, clearCart } = useCart();

  const total = getTotal();
  const tax = total * 0.08;
  const grandTotal = total + tax;

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const methodAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.spring(methodAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.spring(buttonAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    // Pulse animation for processing state
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handlePayment = async () => {
    if (!selectedStore) return;

    setIsProcessing(true);

    try {
      const response = await fetch('http://10.113.203.223:5000/api/payment/sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: grandTotal,
          currency: 'usd',
        }),
      });

      const { paymentIntent, paymentIntentId, ephemeralKey, customer } = await response.json();

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: selectedStore.name,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        applePay: { merchantCountryCode: 'US' },
        googlePay: { merchantCountryCode: 'US', testEnv: true },
      });

      if (initError) {
        console.error('Stripe Init Error:', initError);
        // Error haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        navigation.navigate('PaymentError', { message: initError.message });
        setIsProcessing(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          // Error haptic feedback
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          navigation.navigate('PaymentError', {
            message: presentError.localizedMessage || presentError.message || 'Payment failed'
          });
        }
        setIsProcessing(false);
      } else {
        const checkoutResponse = await processCheckout(
          selectedStore.id,
          cartItems.map((item) => ({ id: item.id, quantity: item.quantity, price: item.price })),
          'STRIPE_SHEET',
          paymentIntentId
        );

        if (checkoutResponse.success) {
          // Success haptic feedback - triple burst for celebration!
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
          }
          setTransactionId(checkoutResponse.transactionId);
          setQrCode(checkoutResponse.qrCode);
          clearCart();
          navigation.navigate('QRCode', {
            qrCode: checkoutResponse.qrCode,
            transactionId: checkoutResponse.transactionId
          });
        } else {
          // Error haptic feedback
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          navigation.navigate('PaymentError', { message: 'Payment succeeded but sync failed' });
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      // Error haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      navigation.navigate('PaymentError', { message: 'An unexpected error occurred' });
      setIsProcessing(false);
    }
  };

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#F8FAFF', '#EEF2FF', '#F5F3FF', '#EEF2FF']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <View style={[styles.decorativeOrb, styles.orb1]} />
      <View style={[styles.decorativeOrb, styles.orb2]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Glass Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          {Platform.OS !== 'web' && (
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={glassColors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment</Text>
            <View style={{ width: 44 }} />
          </View>
        </Animated.View>

        {/* Order Summary Card */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: cardAnim,
              transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
            },
          ]}
        >
          {Platform.OS !== 'web' && (
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.summaryContent}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconContainer}>
                <LinearGradient
                  colors={[glassColors.accent.primary, glassColors.accent.secondary]}
                  style={styles.summaryIconGradient}
                >
                  <Ionicons name="receipt" size={22} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.summaryTitle}>Order Summary</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{itemCount} items</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Payment Method Card */}
        <Animated.View
          style={[
            styles.methodCard,
            {
              opacity: methodAnim,
              transform: [{ scale: methodAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
            },
          ]}
        >
          {Platform.OS !== 'web' && (
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.methodContent}>
            <View style={styles.methodIconContainer}>
              <LinearGradient
                colors={['#4338CA', '#6366F1']}
                style={styles.methodIconGradient}
              >
                <Ionicons name="card" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>Secure Checkout</Text>
              <Text style={styles.methodDescription}>Credit card, Apple Pay, Google Pay</Text>
            </View>
            <Ionicons name="checkmark-circle" size={26} color={glassColors.accent.primary} />
          </View>
        </Animated.View>

        {/* Bottom Section */}
        <Animated.View
          style={[
            styles.bottomContainer,
            { transform: [{ translateY: buttonAnim }] },
          ]}
        >
          {Platform.OS !== 'web' && (
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
            style={StyleSheet.absoluteFill}
          />
          
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator color={glassColors.accent.primary} size="large" />
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          ) : (
            <View style={styles.sliderContainer}>
              <GlassSlider
                title={`Slide to Pay $${grandTotal.toFixed(2)}`}
                icon="shield-checkmark-outline"
                onComplete={handlePayment}
                gradient={[glassColors.accent.primary, glassColors.accent.secondary]}
              />
            </View>
          )}
          
          <View style={styles.secureNote}>
            <Ionicons name="lock-closed" size={14} color={glassColors.text.tertiary} />
            <Text style={styles.secureText}>Secured by Stripe</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  decorativeOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 280,
    height: 280,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    top: -80,
    right: -100,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(236, 72, 153, 0.06)',
    bottom: 150,
    left: -70,
  },
  headerWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glassColors.border.medium,
  },
  headerTitle: {
    fontSize: 20,
    ...typography.title,
    color: glassColors.text.primary,
  },
  summaryCard: {
    margin: 16,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
  },
  summaryContent: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
  },
  summaryIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    ...typography.headline,
    color: glassColors.text.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
  },
  summaryValue: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: glassColors.border.medium,
    marginVertical: 14,
  },
  totalLabel: {
    fontSize: 17,
    ...typography.title,
    color: glassColors.text.primary,
  },
  totalValue: {
    fontSize: 24,
    ...typography.title,
    color: glassColors.accent.primary,
  },
  methodCard: {
    marginHorizontal: 16,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: glassColors.accent.primary,
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  methodIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  methodIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    ...typography.headline,
    color: glassColors.text.primary,
  },
  methodDescription: {
    fontSize: 13,
    ...typography.body,
    color: glassColors.text.secondary,
    marginTop: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    ...glassShadow.medium,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
  },
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 16,
    ...typography.body,
    color: glassColors.text.secondary,
    marginTop: 12,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  secureText: {
    color: glassColors.text.tertiary,
    fontSize: 13,
    ...typography.caption,
    marginLeft: 6,
  },
});

export default PaymentScreen;
