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

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  QRCode: undefined;
};

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'apple_pay', name: 'Apple Pay', icon: 'logo-apple', color: '#000000' },
  { id: 'google_pay', name: 'Google Pay', icon: 'logo-google', color: '#4285F4' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline', color: '#1A1A2E' },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', color: '#003087' },
];

const PaymentScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { selectedStore, cartItems, getTotal, setTransactionId, setQrCode } = useCart();
  
  const scaleAnims = useRef(
    paymentMethods.map(() => new Animated.Value(1))
  ).current;

  const total = getTotal() * 1.08; // Including tax

  const handleMethodSelect = (methodId: string, index: number) => {
    setSelectedMethod(methodId);
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePayment = async () => {
    if (!selectedMethod || !selectedStore) return;

    setIsProcessing(true);

    try {
      const response = await processCheckout(
        selectedStore.id,
        cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
        selectedMethod
      );

      if (response.success) {
        setTransactionId(response.transactionId);
        setQrCode(response.qrCode);
        navigation.navigate('QRCode');
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
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

      {/* Payment Methods */}
      <Text style={styles.sectionTitle}>Select Payment Method</Text>
      <View style={styles.methodsContainer}>
        {paymentMethods.map((method, index) => (
          <TouchableOpacity
            key={method.id}
            activeOpacity={0.9}
            onPress={() => handleMethodSelect(method.id, index)}
          >
            <Animated.View
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
                { transform: [{ scale: scaleAnims[index] }] },
              ]}
            >
              <View
                style={[
                  styles.methodIconContainer,
                  { backgroundColor: `${method.color}15` },
                ]}
              >
                <Ionicons name={method.icon} size={24} color={method.color} />
              </View>
              <Text style={styles.methodName}>{method.name}</Text>
              <View style={styles.radioOuter}>
                {selectedMethod === method.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pay Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedMethod || isProcessing) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedMethod || isProcessing}
          activeOpacity={0.9}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                Pay ${total.toFixed(2)}
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
  payButtonDisabled: {
    backgroundColor: '#A8C8D4',
    shadowOpacity: 0.1,
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
