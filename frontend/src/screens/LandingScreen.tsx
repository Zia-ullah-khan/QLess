import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme/typography';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  QRCode: undefined;
};

type LandingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Landing'>;

interface Props {
  navigation: LandingScreenNavigationProp;
}

const LandingScreen: React.FC<Props> = ({ navigation }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequential animation on mount
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Title animation
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Button
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(buttonSlide, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleStartShopping = () => {
    navigation.navigate('StoreSelect');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Logo Section */}
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
          <View style={styles.logoOuter}>
            <Image
              source={require('../../assets/favicon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: titleFade,
            transform: [{ translateY: titleSlide }],
          }}
        >
          <Text style={styles.title}>QLess</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.features, { opacity: subtitleFade }]}>
          <View style={styles.featureItem}>
            <Ionicons name="scan-outline" size={24} color="#4A90A4" />
            <Text style={styles.featureText}>Scan</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featureItem}>
            <Ionicons name="cart-outline" size={24} color="#4A90A4" />
            <Text style={styles.featureText}>Cart</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featureItem}>
            <Ionicons name="wallet-outline" size={24} color="#4A90A4" />
            <Text style={styles.featureText}>Pay</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featureItem}>
            <Ionicons name="exit-outline" size={24} color="#4A90A4" />
            <Text style={styles.featureText}>Go</Text>
          </View>
        </Animated.View>
      </View>

      {/* CTA Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonFade,
            transform: [{ translateY: buttonSlide }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handleStartShopping}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Start Shopping</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  title: {
    fontSize: 48,
    ...typography.title,
    color: '#1A1A2E',
    letterSpacing: -0.8,
    marginBottom: 36,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  featureText: {
    fontSize: 12,
    ...typography.caption,
    color: '#6B7280',
    marginTop: 6,
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonText: {
    fontSize: 18,
    ...typography.button,
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default LandingScreen;
