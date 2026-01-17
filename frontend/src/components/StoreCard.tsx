import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { typography } from '../theme/typography';

// Store logos mapping (only supported formats: png, jpg)
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

// Fallback colors for stores without compatible logos
const fallbackColors: Record<string, string> = {
  costco: '#E31837',
  wegmans: '#D8232A',
};

interface StoreCardProps {
  id: string;
  name: string;
  logo: string;
  onPress: () => void;
  index: number;
}

const StoreCard: React.FC<StoreCardProps> = ({ id, name, logo, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        delay: index * 35,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        delay: index * 35,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  // Get logo source for store
  const logoSource = storeLogos[id];
  const fallbackColor = fallbackColors[id] || '#4A90A4';

  // Get initials for stores without real logos (fallback)
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
      activeOpacity={0.9}
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
        <View style={[styles.logoContainer, !logoSource && { backgroundColor: fallbackColor }]}>
          {logoSource ? (
            <Animated.Image
              source={logoSource}
              style={[styles.logoImage, { opacity: logoOpacity }]}
              resizeMode="contain"
              onLoadEnd={() => {
                Animated.timing(logoOpacity, {
                  toValue: 1,
                  duration: 180,
                  useNativeDriver: true,
                }).start();
              }}
            />
          ) : (
            <Text style={styles.initials}>{getInitials(name)}</Text>
          )}
        </View>
        <Text style={styles.storeName} numberOfLines={1}>
          {name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    margin: 8,
    width: 150,
    height: 150,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  initials: {
    fontSize: 24,
    ...typography.headline,
    color: '#FFFFFF',
  },
  storeName: {
    fontSize: 14,
    ...typography.headline,
    color: '#1A1A2E',
    textAlign: 'center',
  },
});

export default StoreCard;
