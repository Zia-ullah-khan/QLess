import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useCart } from '../context/CartContext';
import AnimatedCheckmark from '../components/AnimatedCheckmark';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  QRCode: { qrCode: string; transactionId: string };
};

type QRCodeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QRCode'>;
type QRCodeScreenRouteProp = RouteProp<RootStackParamList, 'QRCode'>;

interface Props {
  navigation: QRCodeScreenNavigationProp;
  route: QRCodeScreenRouteProp;
}

const QRCodeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedStore, clearCart } = useCart(); // Don't rely on context for transaction details
  const { qrCode, transactionId } = route.params || {}; // Get from params

  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const qrFadeAnim = useRef(new Animated.Value(0)).current;
  const qrScaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Show QR after checkmark animation
    setTimeout(() => {
      setShowQR(true);
      Animated.parallel([
        Animated.timing(qrFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(qrScaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDone = () => {
    clearCart();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <AnimatedCheckmark size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for shopping at {selectedStore?.name}
          </Text>
        </View>

        {/* QR Code Card */}
        {showQR && (
          <Animated.View
            style={[
              styles.qrCard,
              {
                opacity: qrFadeAnim,
                transform: [{ scale: qrScaleAnim }],
              },
            ]}
          >
            <View style={styles.qrContainer}>
              <QRCode
                value={qrCode || transactionId || 'QLESS-DEMO'}
                size={width * 0.55}
                backgroundColor="#FFFFFF"
                color="#1A1A2E"
              />
            </View>

            <View style={styles.qrInfo}>
              <Text style={styles.qrInstructions}>
                Scan this QR code at the store exit
              </Text>
              <View style={styles.transactionInfo}>
                <Ionicons name="receipt-outline" size={16} color="#6B7280" />
                <Text style={styles.transactionId} numberOfLines={1} ellipsizeMode="middle">
                  {transactionId}
                </Text>
              </View>
            </View>

            {/* Countdown Timer */}
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={18} color="#FF9800" />
              <Text style={styles.timerText}>
                Valid for {formatTime(countdown)}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Head to the store exit
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Show QR code to the scanner
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Exit and enjoy your purchase!
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Done Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.9}
        >
          <Text style={styles.doneButtonText}>Done</Text>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 26,
    ...typography.title,
    color: '#1A1A2E',
    marginTop: 16,
  },
  successSubtitle: {
    fontSize: 15,
    ...typography.body,
    color: '#6B7280',
    marginTop: 4,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#F0F0F0',
  },
  qrInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrInstructions: {
    fontSize: 16,
    ...typography.headline,
    color: '#1A1A2E',
    textAlign: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  transactionId: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontFamily: 'monospace',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  timerText: {
    fontSize: 14,
    ...typography.headline,
    color: '#FF9800',
    marginLeft: 6,
  },
  instructionsContainer: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90A4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...typography.title,
  },
  instructionText: {
    fontSize: 15,
    ...typography.body,
    color: '#6B7280',
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    ...typography.button,
    marginRight: 8,
  },
});

export default QRCodeScreen;
