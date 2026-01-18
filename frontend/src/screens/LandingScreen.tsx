import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography } from '../theme/typography';
import {
  liquidGlassColors,
  liquidShadow,
  squircle,
  liquidSpring,
  liquidTiming,
  liquidBlur,
  getVibrantText,
} from '../theme/glass';
import GlassSlider from '../components/GlassSlider';
import MergingGlassStack from '../components/MergingGlassStack';
import VibrantTimestamp from '../components/VibrantTimestamp';
import LiquidGlassContainer from '../components/LiquidGlassContainer';
import SkiaLiquidGlass from '../components/SkiaLiquidGlass';
import LiquidBackground from '../components/LiquidBackground';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  AdminLogin: undefined;
  StoreSelect: undefined;
};

type LandingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Landing'>;

interface Props {
  navigation: LandingScreenNavigationProp;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING SCREEN
// iOS 26 Liquid Glass Design Implementation
// ═══════════════════════════════════════════════════════════════════════════════
const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const [isDarkMode] = useState(false); // Can be connected to system theme

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(40)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const stackFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Sequential entrance animation
    Animated.sequence([
      // Logo animation with rotation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          ...liquidSpring.bouncy,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Title animation
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: liquidTiming.default,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          ...liquidSpring.default,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Stacked glass cards
      Animated.timing(stackFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Button
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonSlide, {
          toValue: 0,
          ...liquidSpring.default,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-login check
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'StoreSelect' }],
            });
          }, 1500);
        }
      } catch (e) {
        console.log('Auto login check failed', e);
      }
    };
    checkLogin();
  }, []);

  const rotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Stacked glass card items for MergingGlassStack
  const stackItems = [
    {
      id: 'features',
      content: (
        <View style={styles.featuresContent}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Ionicons name="scan" size={22} color={liquidGlassColors.accent.primary} />
            </View>
            <Text style={styles.featureText}>Scan</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Ionicons name="cart" size={22} color={liquidGlassColors.accent.secondary} />
            </View>
            <Text style={styles.featureText}>Cart</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
              <Ionicons name="card" size={22} color={liquidGlassColors.accent.tertiary} />
            </View>
            <Text style={styles.featureText}>Pay</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="exit" size={22} color={liquidGlassColors.accent.emerald} />
            </View>
            <Text style={styles.featureText}>Go</Text>
          </View>
        </View>
      ),
    },
    {
      id: 'stats',
      content: (
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>50+</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2M+</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      ),
    },
    {
      id: 'timestamp',
      content: (
        <View style={styles.timestampContainer}>
          <VibrantTimestamp
            format="12h"
            showDate={true}
            variant="widget"
            useGradient={true}
            isDarkMode={isDarkMode}
            animated={true}
          />
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Interactive Liquid Background */}
      <View style={StyleSheet.absoluteFill}>
        <LiquidBackground />

        {/* Subtle overlay to ensure text readability if needed */}
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo with Liquid Glass Effect */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: Animated.multiply(logoScale, pulseAnim) },
                  { rotate: rotation },
                ],
              },
            ]}
          >
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.logoGlow,
                { opacity: glowAnim },
              ]}
            />
            <View style={styles.logoOuter}>
              <LinearGradient
                colors={[liquidGlassColors.accent.primary, liquidGlassColors.accent.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <View style={styles.logoInner}>
                  <Ionicons name="flash" size={48} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Title with Vibrant Text */}
          <Animated.View
            style={{
              opacity: titleFade,
              transform: [{ translateY: titleSlide }],
            }}
          >
            <Text style={[
              styles.title,
              { color: '#FFFFFF' }
            ]}>
              QLess
            </Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View style={{ opacity: subtitleFade }}>
            <Text style={[
              styles.subtitle,
              { color: '#FFFFFF' }
            ]}>
              Skip the line. Shop smarter.
            </Text>
          </Animated.View>

        </View>

        {/* Bottom CTA Section */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            },
          ]}
        >
          <GlassSlider
            title="Slide to Start Shopping!"
            icon="lock-closed-outline"
            endIcon="lock-open-outline"
            onComplete={() => navigation.navigate('Login')}
            gradient={[liquidGlassColors.accent.primary, liquidGlassColors.accent.secondary]}
          />

          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminLogin')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color={getVibrantText(isDarkMode, 'secondary')}
            />
            <Text style={[
              styles.adminButtonText,
              { color: getVibrantText(isDarkMode, 'secondary') }
            ]}>
              Admin Access
            </Text>
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
  orb: {
    position: 'absolute',
    opacity: 0.9,
  },
  orbBlur: {
    // Simulated blur effect via opacity
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: liquidGlassColors.accent.primary,
    shadowColor: liquidGlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: squircle.xxl,
    overflow: 'hidden',
    ...liquidShadow.glow,
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 56,
    ...typography.title,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    ...typography.body,
    marginBottom: 32,
  },
  stackContainer: {
    width: '100%',
    maxWidth: 400,
  },
  glassCard: {
    marginBottom: 0,
    shadowColor: liquidGlassColors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  // Feature card content
  featuresContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: squircle.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    ...typography.caption,
    color: '#ffffff',
  },
  featureDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // Stats card content
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    ...typography.title,
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: liquidGlassColors.specular.edgeMedium,
  },
  // Timestamp card content
  timestampContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  adminButtonText: {
    fontSize: 14,
    ...typography.body,
    marginLeft: 6,
  },
});

export default LandingScreen;
