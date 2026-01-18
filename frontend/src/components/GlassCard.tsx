import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
  Pressable,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  liquidGlassColors,
  liquidBlur,
  liquidShadow,
  squircle,
  liquidSpring,
  liquidTiming,
  getAdaptiveColors,
} from '../theme/glass';

// ═══════════════════════════════════════════════════════════════════════════════
// GLASS CARD - iOS 26 Liquid Glass Design
// Four-layer architecture with liquid displacement on hover/touch
// ═══════════════════════════════════════════════════════════════════════════════

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  
  // Glass configuration
  intensity?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick';
  variant?: 'default' | 'elevated' | 'subtle' | 'widget';
  isDarkMode?: boolean;
  glassOpacity?: number;
  
  // Visual effects
  glowColor?: string;
  enableGlow?: boolean;
  
  // Animation
  animated?: boolean;
  delay?: number;
  enableLiquidDisplacement?: boolean;
  
  // Interaction
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  enableHaptics?: boolean;
  
  // Layout
  padding?: number;
  borderRadius?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'regular',
  variant = 'default',
  isDarkMode = false,
  glassOpacity,
  glowColor,
  enableGlow = false,
  animated = true,
  delay = 0,
  enableLiquidDisplacement = false,
  interactive = false,
  onPress,
  onLongPress,
  enableHaptics = true,
  padding,
  borderRadius,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(animated ? 0.95 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;
  
  // Liquid displacement values
  const displacementX = useRef(new Animated.Value(0)).current;
  const displacementY = useRef(new Animated.Value(0)).current;

  // Get blur amount based on intensity
  const blurAmount = liquidBlur[intensity];
  
  // Calculate opacity based on variant and mode
  const getCalculatedOpacity = () => {
    if (glassOpacity !== undefined) return glassOpacity;
    
    const baseOpacity = isDarkMode ? 0.08 : 0.72;
    const variantMultiplier = {
      default: 1,
      elevated: 1.15,
      subtle: 0.65,
      widget: 0.9,
    }[variant];
    
    return Math.min(1, baseOpacity * variantMultiplier);
  };
  
  const calculatedOpacity = getCalculatedOpacity();
  
  // Get shadow based on variant
  const getShadowStyle = () => {
    if (enableGlow) {
      return {
        ...liquidShadow.glow,
        shadowColor: glowColor || liquidGlassColors.accent.primary,
      };
    }
    
    switch (variant) {
      case 'elevated': return liquidShadow.medium;
      case 'subtle': return liquidShadow.subtle;
      case 'widget': return liquidShadow.soft;
      default: return liquidShadow.soft;
    }
  };

  // Get border radius
  const radiusValue = borderRadius ?? (variant === 'elevated' ? squircle.xxl : squircle.xl);
  
  // Get padding
  const paddingValue = padding ?? (variant === 'subtle' ? 16 : 20);

  // Entrance animation
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...liquidSpring.default,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: liquidTiming.default,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, delay]);

  // Glow pulsing animation
  useEffect(() => {
    if (enableGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [enableGlow]);

  // Pan responder for liquid displacement
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableLiquidDisplacement,
      onMoveShouldSetPanResponder: () => enableLiquidDisplacement,
      
      onPanResponderGrant: () => {
        if (enableHaptics && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      
      onPanResponderMove: (_, gestureState) => {
        const maxDisplacement = 12;
        const dx = Math.max(-maxDisplacement, Math.min(maxDisplacement, gestureState.dx * 0.25));
        const dy = Math.max(-maxDisplacement, Math.min(maxDisplacement, gestureState.dy * 0.25));
        
        displacementX.setValue(dx);
        displacementY.setValue(dy);
      },
      
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(displacementX, {
            toValue: 0,
            ...liquidSpring.bouncy,
            useNativeDriver: true,
          }),
          Animated.spring(displacementY, {
            toValue: 0,
            ...liquidSpring.bouncy,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (enableHaptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.spring(pressScale, {
      toValue: 0.97,
      ...liquidSpring.snappy,
      useNativeDriver: true,
    }).start();
  }, [enableHaptics]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      ...liquidSpring.default,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get gradient colors
  const getGradientColors = () => {
    const opacity1 = calculatedOpacity;
    const opacity2 = calculatedOpacity * 0.6;
    return [
      `rgba(255, 255, 255, ${opacity1})`,
      `rgba(255, 255, 255, ${opacity2})`,
    ];
  };

  // Get border color
  const borderColor = isDarkMode 
    ? liquidGlassColors.specular.edgeDark 
    : liquidGlassColors.specular.edgeLight;

  const cardContent = (
    <Animated.View
      style={[
        styles.container,
        { borderRadius: radiusValue, borderColor },
        getShadowStyle(),
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressScale) },
            ...(enableLiquidDisplacement ? [
              { translateX: displacementX },
              { translateY: displacementY },
            ] : []),
          ],
        },
        style,
      ]}
      {...(enableLiquidDisplacement ? panResponder.panHandlers : {})}
    >
      {/* Layer 1: Blur refraction */}
      {Platform.OS !== 'web' && (
        <BlurView
          intensity={blurAmount}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      
      {/* Layer 2: Material surface gradient */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Layer 3: Specular top highlight */}
      <View 
        style={[
          styles.topHighlight,
          { backgroundColor: liquidGlassColors.specular.highlight }
        ]} 
      />
      
      {/* Inner glow border */}
      <View 
        style={[
          styles.innerGlow,
          { 
            borderRadius: radiusValue - 1,
            borderColor: liquidGlassColors.specular.glow,
          }
        ]} 
      />

      {/* Glow effect */}
      {enableGlow && (
        <Animated.View
          style={[
            styles.glowOverlay,
            {
              opacity: glowOpacity,
              backgroundColor: glowColor || liquidGlassColors.accent.primary,
              borderRadius: radiusValue,
            },
          ]}
        />
      )}
      
      {/* Layer 4: Content */}
      <View style={[styles.content, { padding: paddingValue }]}>
        {children}
      </View>
    </Animated.View>
  );

  // Wrap with Pressable if interactive
  if (interactive && (onPress || onLongPress)) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.72)' : 'transparent',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 0.5,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    margin: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  content: {
    zIndex: 2,
  },
});

export default GlassCard;
