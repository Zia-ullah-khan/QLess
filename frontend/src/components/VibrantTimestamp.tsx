import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  liquidGlassColors,
  liquidSpring,
  getVibrantText,
} from '../theme/glass';
import { typography } from '../theme/typography';

// Optional MaskedView import (may not be installed)
let MaskedView: any = null;
try {
  MaskedView = require('@react-native-masked-view/masked-view').default;
} catch (e) {
  // MaskedView not available
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIBRANT TIMESTAMP
// Apple-style timestamp with vibrancy colors and optional gradient text
// ═══════════════════════════════════════════════════════════════════════════════

interface VibrantTimestampProps {
  format?: '12h' | '24h';
  showDate?: boolean;
  showSeconds?: boolean;
  isDarkMode?: boolean;
  
  // Visual
  variant?: 'default' | 'large' | 'compact' | 'widget';
  useGradient?: boolean;
  gradientColors?: string[];
  
  // Animation
  animated?: boolean;
  pulseOnUpdate?: boolean;
  
  // Style
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VibrantTimestamp: React.FC<VibrantTimestampProps> = ({
  format = '12h',
  showDate = false,
  showSeconds = false,
  isDarkMode = false,
  variant = 'default',
  useGradient = false,
  gradientColors,
  animated = true,
  pulseOnUpdate = true,
  style,
  textStyle,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? 10 : 0)).current;

  // Update time every second (or minute if not showing seconds)
  useEffect(() => {
    const interval = setInterval(
      () => {
        setCurrentTime(new Date());
        
        // Pulse animation on update
        if (pulseOnUpdate) {
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.02,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.spring(pulseAnim, {
              toValue: 1,
              ...liquidSpring.snappy,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      showSeconds ? 1000 : 60000
    );

    return () => clearInterval(interval);
  }, [showSeconds, pulseOnUpdate]);

  // Entrance animation
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          ...liquidSpring.default,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated]);

  // Format time
  const formatTime = () => {
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    let period = '';

    if (format === '12h') {
      period = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }

    let timeString = `${hours}:${minutes}`;
    if (showSeconds) {
      timeString += `:${seconds}`;
    }
    if (format === '12h') {
      timeString += period;
    }

    return timeString;
  };

  // Format date
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return currentTime.toLocaleDateString('en-US', options);
  };

  // Get size styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          time: { fontSize: 72, letterSpacing: -3 },
          date: { fontSize: 18, letterSpacing: 0.5 },
        };
      case 'compact':
        return {
          time: { fontSize: 20, letterSpacing: -0.5 },
          date: { fontSize: 12, letterSpacing: 0.2 },
        };
      case 'widget':
        return {
          time: { fontSize: 42, letterSpacing: -1.5 },
          date: { fontSize: 15, letterSpacing: 0.3 },
        };
      default:
        return {
          time: { fontSize: 32, letterSpacing: -1 },
          date: { fontSize: 14, letterSpacing: 0.3 },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const textColor = getVibrantText(isDarkMode, 'primary');
  const secondaryColor = getVibrantText(isDarkMode, 'secondary');
  
  const defaultGradient = [
    liquidGlassColors.accent.primary,
    liquidGlassColors.accent.secondary,
    liquidGlassColors.accent.tertiary,
  ];
  const gradient = gradientColors || defaultGradient;

  // Time text component
  const TimeText = () => (
    <Text
      style={[
        styles.timeText,
        { color: textColor },
        variantStyles.time,
        typography.title,
        textStyle,
      ]}
    >
      {formatTime()}
    </Text>
  );

  // Gradient time text (using MaskedView for gradient effect if available)
  const GradientTimeText = () => {
    // If MaskedView is not available, fall back to accent color
    if (!MaskedView || Platform.OS === 'web') {
      return (
        <Text
          style={[
            styles.timeText,
            { color: liquidGlassColors.accent.primary },
            variantStyles.time,
            typography.title,
            textStyle,
          ]}
        >
          {formatTime()}
        </Text>
      );
    }
    
    return (
      <MaskedView
        maskElement={<TimeText />}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradientContainer,
            variantStyles.time,
          ]}
        >
          <Text
            style={[
              styles.timeText,
              { opacity: 0 },
              variantStyles.time,
              typography.title,
              textStyle,
            ]}
          >
            {formatTime()}
          </Text>
        </LinearGradient>
      </MaskedView>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
          ],
        },
        style,
      ]}
    >
      {/* Date (above time) */}
      {showDate && (
        <Text
          style={[
            styles.dateText,
            { color: secondaryColor },
            variantStyles.date,
            typography.body,
          ]}
        >
          {formatDate()}
        </Text>
      )}
      
      {/* Time */}
      {useGradient ? <GradientTimeText /> : <TimeText />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '200', // Ultra light weight like Apple
    fontVariant: ['tabular-nums'], // Monospace numbers for smooth updates
  },
  dateText: {
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  gradientContainer: {
    // Container for gradient mask
  },
});

export default VibrantTimestamp;
