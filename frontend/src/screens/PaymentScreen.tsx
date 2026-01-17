import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { processCheckout } from '../services/api';
import { typography } from '../theme/typography';
import { useStripe } from '@stripe/stripe-react-native';

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

  const total = getTotal() * 1.08; // Including tax

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePayment = async () => {
    if (!selectedStore) return;

    setIsProcessing(true);

    try {
      // 1. Fetch PaymentIntent from backend
      const response = await fetch('http://10.113.203.223:5000/api/payment/sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount: total,
          currency: 'usd',
        }),
      });

      const { paymentIntent, paymentIntentId, ephemeralKey, customer } = await response.json();

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: selectedStore.name,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        // Apple Pay / Google Pay are enabled by default if configured
        applePay: {
          merchantCountryCode: 'US',
        },
        googlePay: {
          merchantCountryCode: 'US',
          testEnv: true, // Set false for production
        },
      });

      if (initError) {
        console.error('Stripe Init Error:', initError);
        alert(`Stripe Error: ${initError.message}`);
        setIsProcessing(false);
        return;
      }

      // 3. Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Stripe Present Error:', presentError);

        // If it's a real error (not just user cancellation), show the error screen
        if (presentError.code !== 'Canceled') {
          navigation.navigate('PaymentError', {
            message: presentError.localizedMessage || presentError.message || 'Payment failed'
          });
        }

        setIsProcessing(false);
      } else {
        // 4. Success! Now sync with our backend (create Transaction record)
        // Extract PaymentIntent ID from client secret if needed, OR better: use the one returned by backend
        // We need to update backend to return it.
        // For now, let's assume valid paymentIntent string is passed.

        const checkoutResponse = await processCheckout(
          selectedStore.id,
          cartItems.map((item) => ({ id: item.id, quantity: item.quantity, price: item.price })),
          'STRIPE_SHEET',
          paymentIntentId
        );

        if (checkoutResponse.success) {
          setTransactionId(checkoutResponse.transactionId);
          setQrCode(checkoutResponse.qrCode);
          clearCart();
          navigation.navigate('QRCode', {
            qrCode: checkoutResponse.qrCode,
            transactionId: checkoutResponse.transactionId
          });
        } else {
          alert('Payment success but backend sync failed.');
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Order Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="receipt-outline" size={24} color="#4A90A4" />
          <Text style={styles.summaryTitle}>Order Summary</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {cartItems.reduce((sum, i) => sum + i.quantity, 0)} items
          </Text>
          <Text style={styles.summaryValue}>${(total / 1.08).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${(total - total / 1.08).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Methods - Simplified for Stripe */}
      <View style={styles.methodsContainer}>
        <View style={[styles.methodCard, styles.methodCardSelected]}>
          <View style={[styles.methodIconContainer, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="card" size={24} color="#4338CA" />
          </View>
          <Text style={styles.methodName}>Credit/Debit Card & Wallets</Text>
          <Ionicons name="checkmark-circle" size={22} color="#4A90A4" />
        </View>
      </View>

      {/* Pay Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.9}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="card" size={18} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                Stripe Checkout ${total.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>
          <Ionicons name="shield-checkmark" size={12} color="#6B7280" /> Secure payment
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    ...typography.title,
    color: '#1A1A2E',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 17,
    ...typography.headline,
    color: '#1A1A2E',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    ...typography.body,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 15,
    ...typography.body,
    color: '#1A1A2E',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    ...typography.title,
    color: '#1A1A2E',
  },
  totalValue: {
    fontSize: 20,
    ...typography.title,
    color: '#4A90A4',
  },
  sectionTitle: {
    fontSize: 16,
    ...typography.headline,
    color: '#6B7280',
    marginLeft: 20,
    marginBottom: 12,
  },
  methodsContainer: {
    paddingHorizontal: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: '#4A90A4',
    backgroundColor: '#F8FBFC',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  methodName: {
    flex: 1,
    fontSize: 16,
    ...typography.headline,
    color: '#1A1A2E',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90A4',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90A4',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#4A90A4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    ...typography.button,
    marginLeft: 8,
  },
  secureText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    ...typography.caption,
    marginTop: 12,
  },
});

export default PaymentScreen;
