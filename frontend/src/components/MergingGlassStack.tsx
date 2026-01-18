import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  liquidGlassColors,
  liquidBlur,
  liquidShadow,
  squircle,
  liquidSpring,
  liquidTiming,
} from '../theme/glass';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════════════════
// MERGING GLASS STACK
// Stacked glass cards with Apple's signature "merging" effect
// where overlapping glass creates a unified visual appearance
// ═══════════════════════════════════════════════════════════════════════════════

interface GlassStackItem {
  id: string;
  content: React.ReactNode;
  height?: number;
  glassOpacity?: number;
}

interface MergingGlassStackProps {
  items: GlassStackItem[];
  style?: ViewStyle;
  isDarkMode?: boolean;
  
  // Stack configuration
  overlapAmount?: number; // How much cards overlap (default: 24)
  baseOpacity?: number;   // Starting opacity for first card
  opacityDecrement?: number; // Opacity decrease per card
  
  // Animation
  animated?: boolean;
  staggerDelay?: number;
  
  // Visual
  enableShimmer?: boolean;
  borderRadius?: number;
}

const MergingGlassStack: React.FC<MergingGlassStackProps> = ({
  items,
  style,
  isDarkMode = false,
  overlapAmount = 24,
  baseOpacity = 0.85,
  opacityDecrement = 0.1,
  animated = true,
  staggerDelay = 100,
  enableShimmer = true,
  borderRadius = squircle.xxl,
}) => {
  // Animation refs for each item
  const animations = useRef(
    items.map(() => ({
      scale: new Animated.Value(animated ? 0.9 : 1),
      opacity: new Animated.Value(animated ? 0 : 1),
      translateY: new Animated.Value(animated ? 30 : 0),
    }))
  ).current;
  
  // Shimmer animation
  const shimmerPosition = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (animated) {
      // Stagger entrance animation for each card
      const entranceAnimations = animations.map((anim, index) => 
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            ...liquidSpring.default,
            delay: index * staggerDelay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: liquidTiming.default,
            delay: index * staggerDelay,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 0,
            ...liquidSpring.gentle,
            delay: index * staggerDelay,
            useNativeDriver: true,
          }),
        ])
      );
      
      Animated.stagger(staggerDelay, entranceAnimations).start();
    }
  }, [animated]);

  // Shimmer animation loop
  useEffect(() => {
    if (enableShimmer) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerPosition, {
            toValue: SCREEN_WIDTH + 150,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerPosition, {
            toValue: -150,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [enableShimmer]);

  // Calculate z-index and position for each card
  const getCardStyle = (index: number): ViewStyle => {
    const opacity = Math.max(0.3, baseOpacity - (index * opacityDecrement));
    const zIndex = items.length - index;
    const marginTop = index === 0 ? 0 : -overlapAmount;
    
    return {
      zIndex,
      marginTop,
    };
  };

  // Get gradient colors with calculated opacity
  const getGradientColors = (index: number): [string, string] => {
    const opacity = Math.max(0.35, baseOpacity - (index * opacityDecrement));
    const opacity2 = opacity * 0.65;
    
    if (isDarkMode) {
      return [
        `rgba(255, 255, 255, ${opacity * 0.12})`,
        `rgba(255, 255, 255, ${opacity2 * 0.12})`,
      ];
    }
    
    return [
      `rgba(255, 255, 255, ${opacity})`,
      `rgba(255, 255, 255, ${opacity2})`,
    ];
  };

  // Get border color based on position (top cards are more visible)
  const getBorderColor = (index: number): string => {
    const baseAlpha = isDarkMode ? 0.15 : 0.5;
    const alpha = Math.max(0.1, baseAlpha - (index * 0.08));
    return `rgba(255, 255, 255, ${alpha})`;
  };

  // Get blur intensity (back cards have slightly more blur for depth)
  const getBlurIntensity = (index: number): number => {
    return liquidBlur.regular + (index * 5);
  };

  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => {
        const cardStyle = getCardStyle(index);
        const anim = animations[index];
        
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.cardWrapper,
              cardStyle,
              {
                opacity: anim.opacity,
                transform: [
                  { scale: anim.scale },
                  { translateY: anim.translateY },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  borderRadius,
                  borderColor: getBorderColor(index),
                  minHeight: item.height,
                },
                index === 0 ? liquidShadow.medium : liquidShadow.subtle,
              ]}
            >
              {/* Layer 1: Blur refraction */}
              {Platform.OS !== 'web' && (
                <BlurView
                  intensity={getBlurIntensity(index)}
                  tint={isDarkMode ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
              )}
              
              {/* Layer 2: Material surface tint */}
              <LinearGradient
                colors={getGradientColors(index)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              
              {/* Layer 3: Specular edge - Top highlight */}
              <View 
                style={[
                  styles.topHighlight,
                  { 
                    opacity: 1 - (index * 0.2),
                    backgroundColor: liquidGlassColors.specular.highlight,
                  }
                ]} 
              />
              
              {/* Inner glow border */}
              <View 
                style={[
                  styles.innerGlow,
                  { 
                    borderRadius: borderRadius - 1,
                    borderColor: `rgba(255, 255, 255, ${0.25 - (index * 0.05)})`,
                  }
                ]} 
              />
              
              {/* Merge line effect (where cards connect) */}
              {index > 0 && (
                <View style={styles.mergeLineContainer}>
                  <LinearGradient
                    colors={[
                      'transparent',
                      `rgba(255, 255, 255, ${isDarkMode ? 0.08 : 0.4})`,
                      'transparent',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.mergeLine}
                  />
                </View>
              )}
              
              {/* Shimmer effect (first card only) */}
              {enableShimmer && index === 0 && (
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      transform: [{ translateX: shimmerPosition }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={liquidGlassColors.gradients.liquidShimmer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                  />
                </Animated.View>
              )}
              
              {/* Layer 4: Content */}
              <View style={styles.content}>
                {item.content}
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container holds all stacked cards
  },
  cardWrapper: {
    // Individual card wrapper for animation
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.75)' : 'transparent',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    borderRadius: 0.5,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    margin: 1,
  },
  mergeLineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
  },
  mergeLine: {
    flex: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 150,
    zIndex: 5,
    opacity: 0.5,
  },
  shimmerGradient: {
    flex: 1,
  },
  content: {
    padding: 20,
    zIndex: 10,
  },
});

export default MergingGlassStack;
