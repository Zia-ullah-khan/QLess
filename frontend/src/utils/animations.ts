import { Animated, Easing } from 'react-native';

// Fade in animation
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

// Fade out animation
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

// Scale animation
export const scaleIn = (
  animatedValue: Animated.Value,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    friction: 6,
    tension: 40,
    useNativeDriver: true,
  });
};

// Slide from bottom
export const slideFromBottom = (
  animatedValue: Animated.Value,
  duration: number = 400
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

// Bounce animation
export const bounce = (
  animatedValue: Animated.Value,
  toValue: number = 1
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    friction: 3,
    tension: 40,
    useNativeDriver: true,
  });
};

// Pulse animation (for continuous effects)
export const pulse = (
  animatedValue: Animated.Value,
  minValue: number = 0.95,
  maxValue: number = 1.05
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ])
  );
};

// Shake animation (for errors)
export const shake = (animatedValue: Animated.Value): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
};

// Stagger children animation helper
export const staggeredFadeIn = (
  animatedValues: Animated.Value[],
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  return Animated.stagger(
    staggerDelay,
    animatedValues.map((value) => fadeIn(value))
  );
};
