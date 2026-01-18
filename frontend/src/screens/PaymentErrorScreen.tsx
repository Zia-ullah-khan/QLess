import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius } from '../theme/glass';

type RootStackParamList = {
  Landing: undefined;
  Cart: undefined;
  Payment: undefined;
  PaymentError: { message: string };
};

type PaymentErrorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentError'>;
type PaymentErrorScreenRouteProp = RouteProp<RootStackParamList, 'PaymentError'>;

interface Props {
  navigation: PaymentErrorScreenNavigationProp;
  route: PaymentErrorScreenRouteProp;
}

const PaymentErrorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { message } = route.params || { message: 'An error occurred' };

  // Animations
  const iconScale = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Error haptic feedback - double buzz pattern for "uh oh" feeling
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 200);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 350);
    }

    // Entrance animation sequence
    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.parallel([
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 0,
        friction: 8,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Gradient Background - reddish tint for error */}
      <LinearGradient
        colors={['#FEF2F2', '#FEE2E2', '#FECACA', '#FEE2E2']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <View style={[styles.decorativeOrb, styles.orb1]} />
      <View style={[styles.decorativeOrb, styles.orb2]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Error Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: iconScale },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            <View style={styles.iconGlow} />
            <View style={styles.iconCircle}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="close" size={60} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Error Card */}
          <Animated.View
            style={[
              styles.errorCard,
              {
                opacity: contentAnim,
                transform: [
                  {
                    translateY: contentAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {Platform.OS !== 'web' && (
              <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
            )}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.75)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.errorCardContent}>
              <Text style={styles.errorTitle}>Payment Failed</Text>
              <Text style={styles.errorMessage}>{message}</Text>
              
              <View style={styles.helpSection}>
                <View style={styles.helpItem}>
                  <Ionicons name="card-outline" size={20} color={glassColors.text.tertiary} />
                  <Text style={styles.helpText}>Check your card details</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="wifi-outline" size={20} color={glassColors.text.tertiary} />
                  <Text style={styles.helpText}>Ensure you have internet connection</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="wallet-outline" size={20} color={glassColors.text.tertiary} />
                  <Text style={styles.helpText}>Verify sufficient funds</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Buttons */}
        <Animated.View
          style={[
            styles.bottomContainer,
            { transform: [{ translateY: buttonAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.backButtonText}>Back to Cart</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    top: -100,
    right: -80,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    bottom: 150,
    left: -60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  errorCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
  },
  errorCardContent: {
    padding: 28,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 26,
    ...typography.title,
    color: '#DC2626',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  helpSection: {
    width: '100%',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  helpText: {
    fontSize: 14,
    ...typography.body,
    color: glassColors.text.secondary,
    marginLeft: 12,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  retryButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 14,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    ...typography.button,
    marginLeft: 8,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backButtonText: {
    fontSize: 15,
    ...typography.button,
    color: glassColors.text.secondary,
  },
});

export default PaymentErrorScreen;
