import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
  Pressable,
  PanResponder,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  liquidGlassColors,
  liquidBlur,
  liquidShadow,
  squircle,
  specularEdge,
  liquidSpring,
  liquidTiming,
  getAdaptiveColors,
} from '../theme/glass';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS CONTAINER
// Four-layer glass architecture with liquid displacement animation
// ═══════════════════════════════════════════════════════════════════════════════

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  
  // Glass configuration
  isDarkMode?: boolean;
  glassOpacity?: number; // 0-1, dynamic opacity control
  variant?: 'primary' | 'secondary' | 'elevated' | 'ultraThin';
  
  // Visual effects
  blurIntensity?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick';
  enableGlow?: boolean;
  glowColor?: string;
  
  // Interaction
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  enableHaptics?: boolean;
  
  // Animation
  animated?: boolean;
  animationDelay?: number;
  enableLiquidDisplacement?: boolean;
  
  // Layout
  padding?: number;
  borderRadius?: number;
}

const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  children,
  style,
  isDarkMode = false,
  glassOpacity,
  variant = 'primary',
  blurIntensity = 'regular',
  enableGlow = false,
  glowColor,
  interactive = false,
  onPress,
  onLongPress,
  enableHaptics = true,
  animated = true,
  animationDelay = 0,
  enableLiquidDisplacement = false,
  padding = 20,
  borderRadius,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(animated ? 0.95 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;
  
  // Liquid displacement animation values
  const displacementX = useRef(new Animated.Value(0)).current;
  const displacementY = useRef(new Animated.Value(0)).current;
  const shimmerPosition = useRef(new Animated.Value(-100)).current;

  // Get adaptive colors based on dark mode
  const colors = getAdaptiveColors(isDarkMode);
  
  // Calculate opacity based on dark/light mode
  const calculatedOpacity = glassOpacity ?? (isDarkMode ? 0.08 : 0.72);
  
  // Get blur amount
  const blurAmount = liquidBlur[blurIntensity];
  
  // Get border radius
  const radiusValue = borderRadius ?? squircle.xl;

  // Entrance animation
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...liquidSpring.default,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: liquidTiming.default,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, animationDelay]);

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

  // Shimmer animation for liquid effect
  useEffect(() => {
    if (enableLiquidDisplacement) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerPosition, {
            toValue: SCREEN_WIDTH + 100,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerPosition, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [enableLiquidDisplacement]);

  // Pan responder for liquid displacement on touch
  // Only activates on movement, not on initial touch - allows children to receive taps
  const panResponder = useRef(
    PanResponder.create({
      // Don't capture on initial touch - let children handle taps
      onStartShouldSetPanResponder: () => false,
      // Only capture after significant movement for the liquid effect
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enableLiquidDisplacement) return false;
        // Only capture if moved more than 5 pixels (prevents blocking taps)
        const moved = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        return moved;
      },
      
      onPanResponderGrant: () => {
        if (enableHaptics && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      
      onPanResponderMove: (_, gestureState) => {
        // Map touch position to displacement (limited range)
        const maxDisplacement = 15;
        const dx = Math.max(-maxDisplacement, Math.min(maxDisplacement, gestureState.dx * 0.3));
        const dy = Math.max(-maxDisplacement, Math.min(maxDisplacement, gestureState.dy * 0.3));
        
        displacementX.setValue(dx);
        displacementY.setValue(dy);
      },
      
      onPanResponderRelease: () => {
        // Animate back to center with liquid spring
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

  // Get material tint color with opacity
  const getMaterialTint = () => {
    const baseColor = isDarkMode ? '255, 255, 255' : '255, 255, 255';
    return `rgba(${baseColor}, ${calculatedOpacity})`;
  };

  // Get gradient colors for material surface
  const getGradientColors = () => {
    const opacity1 = calculatedOpacity;
    const opacity2 = calculatedOpacity * 0.6;
    return [
      `rgba(255, 255, 255, ${opacity1})`,
      `rgba(255, 255, 255, ${opacity2})`,
    ];
  };

  // Get border color based on mode
  const borderColor = isDarkMode 
    ? liquidGlassColors.specular.edgeDark 
    : liquidGlassColors.specular.edgeLight;

  // Shadow style
  const shadowStyle = enableGlow 
    ? { ...liquidShadow.glow, shadowColor: glowColor || liquidGlassColors.accent.primary }
    : liquidShadow.soft;

  // Build the container
  const containerContent = (
    <Animated.View
      style={[
        styles.container,
        { borderRadius: radiusValue, borderColor },
        shadowStyle,
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
      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 1: REFRACTION (Blur + Saturation)
          ═══════════════════════════════════════════════════════════════════════ */}
      {Platform.OS !== 'web' && (
        <BlurView
          intensity={blurAmount}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 2: MATERIAL SURFACE (Dynamic Tint)
          ═══════════════════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 3: SPECULAR EDGE (Hairline Stroke + Inner Glow)
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* Top highlight (simulates light source) */}
      <View 
        style={[
          styles.topHighlight,
          { backgroundColor: liquidGlassColors.specular.highlight }
        ]} 
      />
      
      {/* Inner border glow */}
      <View 
        style={[
          styles.innerGlow,
          { 
            borderRadius: radiusValue - 1,
            borderColor: liquidGlassColors.specular.glow,
          }
        ]} 
      />

      {/* Glow effect (optional) */}
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

      {/* Liquid shimmer effect */}
      {enableLiquidDisplacement && (
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

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 4: VIBRANT CONTENT
          ═══════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.content, { padding }]}>
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
        {containerContent}
      </Pressable>
    );
  }

  return containerContent;
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
    left: 20,
    right: 20,
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
    opacity: 0.1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 1,
  },
  shimmerGradient: {
    flex: 1,
  },
  content: {
    zIndex: 2,
  },
});

export default LiquidGlassContainer;
