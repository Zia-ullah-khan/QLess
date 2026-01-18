import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useCart } from '../context/CartContext';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius } from '../theme/glass';
import GlassSlider from '../components/GlassSlider';

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
  const { selectedStore, clearCart } = useCart();
  const { qrCode, transactionId } = route.params || {};

  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState(300);

  // Animations
  const successAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const qrAnim = useRef(new Animated.Value(0)).current;
  const instructionsAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Celebration haptic feedback - ascending intensity pattern!
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 500);
    }

    // Success sequence animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
        Animated.spring(checkScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      ]),
      Animated.delay(800),
    ]).start(() => {
      setShowQR(true);
      Animated.parallel([
        Animated.spring(qrAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(instructionsAnim, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
        Animated.spring(buttonAnim, { toValue: 0, friction: 8, delay: 300, useNativeDriver: true }),
      ]).start();
    });

    // Continuous pulse for QR
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Countdown timer with haptic feedback that intensifies
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newValue = prev - 1;
        
        if (Platform.OS !== 'web') {
          // Vibration pattern gets faster as time runs out
          if (newValue <= 0) {
            // Time's up - urgent triple buzz
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } else if (newValue <= 5) {
            // Last 5 seconds - vibrate every second (heavy)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else if (newValue <= 10) {
            // Last 10 seconds - vibrate every second (medium)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else if (newValue <= 30 && newValue % 2 === 0) {
            // Last 30 seconds - vibrate every 2 seconds (light)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else if (newValue <= 60 && newValue % 5 === 0) {
            // Last minute - vibrate every 5 seconds
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else if (newValue % 60 === 0) {
            // Every minute mark
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
        
        if (newValue <= 0) {
          clearInterval(timer);
          return 0;
        }
        return newValue;
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#F0FDF4', '#ECFDF5', '#D1FAE5', '#ECFDF5']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <View style={[styles.decorativeOrb, styles.orb1]} />
      <View style={[styles.decorativeOrb, styles.orb2]} />
      <View style={[styles.decorativeOrb, styles.orb3]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Header */}
          <Animated.View
            style={[
              styles.successHeader,
              {
                opacity: successAnim,
                transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              },
            ]}
          >
            {/* Animated check circle */}
            <View style={styles.checkContainer}>
              <Animated.View style={[styles.checkGlow, { opacity: glowAnim }]} />
              <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
                <LinearGradient
                  colors={[glassColors.accent.emerald, '#059669']}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="checkmark" size={50} color="#FFFFFF" />
              </Animated.View>
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for shopping at {selectedStore?.name}
            </Text>
          </Animated.View>

          {/* QR Code Card */}
          {showQR && (
            <Animated.View
              style={[
                styles.qrCard,
                {
                  opacity: qrAnim,
                  transform: [
                    { scale: Animated.multiply(qrAnim, pulseAnim) },
                  ],
                },
              ]}
            >
              {Platform.OS !== 'web' && (
                <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
              )}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.topHighlight} />
              
              <View style={styles.qrContent}>
                <View style={styles.qrWrapper}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
                    style={styles.qrBackground}
                  />
                  <QRCode
                    value={qrCode || transactionId || 'QLESS-DEMO'}
                    size={width * 0.5}
                    backgroundColor="transparent"
                    color={glassColors.text.primary}
                  />
                </View>

                <Text style={styles.qrInstructions}>
                  Scan at exit to leave the store
                </Text>

                <View style={styles.transactionInfo}>
                  <Ionicons name="receipt-outline" size={14} color={glassColors.text.tertiary} />
                  <Text style={styles.transactionId} numberOfLines={1} ellipsizeMode="middle">
                    {transactionId}
                  </Text>
                </View>

                {/* Timer Badge */}
                <View style={styles.timerBadge}>
                  <LinearGradient
                    colors={countdown > 60 
                      ? ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.08)']
                      : ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.08)']
                    }
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={countdown > 60 ? '#F59E0B' : '#EF4444'} 
                  />
                  <Text style={[
                    styles.timerText,
                    { color: countdown > 60 ? '#F59E0B' : '#EF4444' }
                  ]}>
                    Valid for {formatTime(countdown)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Instructions */}
          <Animated.View
            style={[
              styles.instructionsContainer,
              { opacity: instructionsAnim },
            ]}
          >
            {[
              { num: 1, text: 'Head to the store exit', icon: 'walk-outline' },
              { num: 2, text: 'Show QR code to scanner', icon: 'qr-code-outline' },
              { num: 3, text: 'Exit and enjoy!', icon: 'happy-outline' },
            ].map((item, index) => (
              <View key={item.num} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <LinearGradient
                    colors={[glassColors.accent.emerald, '#059669']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.instructionNumberText}>{item.num}</Text>
                </View>
                <Text style={styles.instructionText}>{item.text}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Done Slider */}
        <Animated.View
          style={[
            styles.bottomContainer,
            { transform: [{ translateY: buttonAnim }] },
          ]}
        >
          <GlassSlider
            title="Slide to Finish"
            icon="checkmark-done-outline"
            onComplete={handleDone}
            gradient={[glassColors.accent.emerald, '#059669']}
          />
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
    width: 300,
    height: 300,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    top: -100,
    right: -80,
  },
  orb2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    bottom: 200,
    left: -50,
  },
  orb3: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    top: 200,
    left: -30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: glassColors.accent.emerald,
    shadowColor: glassColors.accent.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...glassShadow.glow,
  },
  successTitle: {
    fontSize: 28,
    ...typography.title,
    color: glassColors.text.primary,
  },
  successSubtitle: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
    marginTop: 6,
  },
  qrCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    marginBottom: 24,
    ...glassShadow.medium,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  qrContent: {
    padding: 24,
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 20,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 20,
  },
  qrBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
  },
  qrInstructions: {
    fontSize: 17,
    ...typography.headline,
    color: glassColors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionId: {
    fontSize: 12,
    color: glassColors.text.tertiary,
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    maxWidth: 200,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    overflow: 'hidden',
  },
  timerText: {
    fontSize: 15,
    ...typography.headline,
    marginLeft: 8,
  },
  instructionsContainer: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  instructionNumberText: {
    color: '#FFFFFF',
    fontSize: 15,
    ...typography.headline,
  },
  instructionText: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
});

export default QRCodeScreen;
