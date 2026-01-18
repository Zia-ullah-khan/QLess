import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { typography } from '../theme/typography';
import {
  liquidGlassColors,
  liquidShadow,
  squircle,
  glassColors,
  radius,
} from '../theme/glass';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GlassSliderProps {
  onComplete: () => void;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: string[];
  disabled?: boolean;
  width?: number;
}

const SLIDER_HEIGHT = 72;
const THUMB_SIZE = 58;
const PADDING = 7;

const GlassSlider: React.FC<GlassSliderProps> = ({
  onComplete,
  title,
  icon = 'arrow-forward',
  gradient = [glassColors.accent.primary, glassColors.accent.secondary],
  disabled = false,
  width = SCREEN_WIDTH - 48,
}) => {
  const [completed, setCompleted] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  const MAX_SLIDE = width - THUMB_SIZE - PADDING * 2;

  // Shimmer animation
  React.useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const handleComplete = () => {
    if (completed || disabled) return;
    
    setCompleted(true);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Success animation
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(thumbScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onComplete();
      }, 300);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !completed && !disabled,
      onMoveShouldSetPanResponder: () => !completed && !disabled,
      
      onPanResponderGrant: () => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(thumbScale, {
          toValue: 0.95,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
      
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, Math.min(gestureState.dx, MAX_SLIDE));
        translateX.setValue(newValue);
        
        // Fade text as slider moves
        const progress = newValue / MAX_SLIDE;
        textOpacity.setValue(1 - progress * 1.5);
        
        // Haptic feedback at certain points
        if (Platform.OS !== 'web') {
          if (progress > 0.5 && progress < 0.52) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          if (progress > 0.9 && progress < 0.92) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      },
      
      onPanResponderRelease: (_, gestureState) => {
        const progress = gestureState.dx / MAX_SLIDE;
        
        Animated.spring(thumbScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
        
        if (progress > 0.85) {
          // Complete the slide
          Animated.spring(translateX, {
            toValue: MAX_SLIDE,
            friction: 6,
            useNativeDriver: true,
          }).start(handleComplete);
        } else {
          // Reset position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, width + 100],
  });

  return (
    <View style={[styles.container, { width }]}>
      {/* Glass track background */}
      {Platform.OS !== 'web' && (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Inner shadow/border effect */}
      <View style={styles.innerBorder} />
      
      {/* Top highlight */}
      <View style={styles.topHighlight} />

      {/* Shimmer effect */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>

      {/* Text label */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.text}>{title}</Text>
        <View style={styles.arrowHints}>
          <Ionicons name="chevron-forward" size={16} color="rgba(99, 102, 241, 0.3)" />
          <Ionicons name="chevron-forward" size={16} color="rgba(99, 102, 241, 0.5)" />
          <Ionicons name="chevron-forward" size={16} color="rgba(99, 102, 241, 0.7)" />
        </View>
      </Animated.View>

      {/* Draggable thumb */}
      <Animated.View
        style={[
          styles.thumbContainer,
          {
            transform: [
              { translateX },
              { scale: thumbScale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.thumb}>
          <LinearGradient
            colors={completed ? ['#10B981', '#059669'] : gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Success checkmark overlay */}
          <Animated.View
            style={[
              styles.successOverlay,
              {
                transform: [{ scale: successScale }],
                opacity: successScale,
              },
            ]}
          >
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
          </Animated.View>
          
          {/* Normal icon */}
          <Animated.View
            style={{
              opacity: successScale.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }}
          >
            <Ionicons name={icon} size={24} color="#FFFFFF" />
          </Animated.View>
        </View>
        
        {/* Thumb glow */}
        <View style={[styles.thumbGlow, { backgroundColor: gradient[0] }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.6)' : 'transparent',
    shadowColor: glassColors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SLIDER_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    margin: 1,
  },
  topHighlight: {
    position: 'absolute',
    top: 1,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
  },
  textContainer: {
    position: 'absolute',
    left: THUMB_SIZE + PADDING + 10,
    right: 20,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 17,
    ...typography.button,
    color: glassColors.text.primary,
    marginRight: 8,
  },
  arrowHints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbContainer: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  thumbGlow: {
    position: 'absolute',
    width: THUMB_SIZE + 20,
    height: THUMB_SIZE + 20,
    borderRadius: (THUMB_SIZE + 20) / 2,
    top: -10,
    left: -10,
    opacity: 0.2,
    zIndex: -1,
  },
  successOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassSlider;
