import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius } from '../theme/glass';

// Store logos mapping
const storeLogos: Record<string, ImageSourcePropType> = {
  nike: require('../../assets/logos/NIKE.png'),
  'under-armour': require('../../assets/logos/under-armour.jpg'),
  walmart: require('../../assets/logos/Walmart.png'),
  costco: require('../../assets/logos/Costco.png'),
  cvs: require('../../assets/logos/CVS.jpg'),
  'banana-republic': require('../../assets/logos/Banana-Republic.png'),
  bestbuy: require('../../assets/logos/Best_Buy.png'),
  wegmans: require('../../assets/logos/wegmans.png'),
  zara: require('../../assets/logos/ZARA.jpg'),
  gap: require('../../assets/logos/Gap.png'),
};

// Gradient colors for different stores
const storeGradients: Record<string, string[]> = {
  nike: ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.02)'],
  walmart: ['rgba(0, 120, 215, 0.08)', 'rgba(255, 196, 0, 0.05)'],
  costco: ['rgba(227, 24, 55, 0.08)', 'rgba(0, 83, 159, 0.05)'],
  default: ['rgba(99, 102, 241, 0.06)', 'rgba(139, 92, 246, 0.03)'],
};

interface StoreCardProps {
  id: string;
  name: string;
  logo: string;
  onPress: () => void;
  index: number;
}

const StoreCard: React.FC<StoreCardProps> = ({ id, name, logo, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.94,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Get logo source
  const isUrl = logo?.startsWith('http') || logo?.startsWith('https');
  const logoSource = isUrl ? { uri: logo } : storeLogos[id];
  const gradientColors = storeGradients[id] || storeGradients.default;

  const getInitials = (storeName: string) => {
    return storeName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Glass background */}
        {Platform.OS !== 'web' && (
          <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        )}
        
        {/* Gradient overlay */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Store-specific accent gradient */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top highlight */}
        <View style={styles.topHighlight} />

        {/* Glow effect on press */}
        <Animated.View
          style={[
            styles.glowOverlay,
            { opacity: glowAnim },
          ]}
        />

        {/* Logo container */}
        <View style={styles.logoContainer}>
          {logoSource ? (
            <Animated.Image
              source={logoSource}
              style={[styles.logoImage, { opacity: logoOpacity }]}
              resizeMode="contain"
              onLoadEnd={() => {
                Animated.timing(logoOpacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              }}
            />
          ) : (
            <LinearGradient
              colors={[glassColors.accent.primary, glassColors.accent.secondary]}
              style={styles.initialsContainer}
            >
              <Text style={styles.initials}>{getInitials(name)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Store name */}
        <Text style={styles.storeName} numberOfLines={1}>
          {name}
        </Text>

        {/* Tap indicator */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>Tap to enter</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    overflow: 'hidden',
    margin: 8,
    width: 155,
    height: 170,
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.75)' : 'transparent',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: glassColors.accent.primary,
    opacity: 0.08,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...glassShadow.soft,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 24,
    ...typography.headline,
    color: '#FFFFFF',
  },
  storeName: {
    fontSize: 15,
    ...typography.headline,
    color: glassColors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  tapIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  tapText: {
    fontSize: 11,
    ...typography.caption,
    color: glassColors.accent.primary,
  },
});

export default StoreCard;
