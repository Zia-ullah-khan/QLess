import React, { useRef, useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Platform,
} from "react-native";
import {
  Canvas,
  Skia,
  Shader,
  Fill,
  Text,
  matchFont,
  Group,
  RoundedRect,
  LinearGradient,
  vec,
  Circle,
  Box,
  rrect,
  BoxShadow,
  Blur,
  useFont,
  Paint,
  ImageFilter,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useDerivedValue,
  withSpring,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { glassColors } from "../theme/glass";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDER_HEIGHT = 72;
const THUMB_SIZE = 58;
const PADDING = 7;

interface GlassSliderProps {
  onComplete: () => void;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  endIcon?: keyof typeof Ionicons.glyphMap;
  gradient?: string[];
  disabled?: boolean;
  width?: number;
}

// Shader for text distortion (lens/repel effect)
const distortionShaderSource = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float2 thumbPos;
uniform float radius;
uniform float strength;

half4 main(float2 xy) {
  float d = distance(xy, thumbPos);
  
  // Calculate displacement
  // Push pixels AWAY from thumb significantly to create a "hole" or "lens" effect
  // strength * (1.0 - smoothstep(0, radius, d))
  // smoothstep(radius, 0, d) gives 1 at center, 0 at radius
  
  float influence = smoothstep(radius, 0.0, d);
  float2 dir = normalize(xy - thumbPos);
  
  // Inverse direction mapping (pulling from outside towards inside? no, we want to push away)
  // To render pixel at XY, we need to know where it CAME from.
  // If we want the image to look pushed away, the pixel at XY should sample from closer to the center.
  
  float2 offset = dir * influence * strength * -1.0; 
  
  return image.eval(xy + offset);
}
`)!;

const GlassSlider: React.FC<GlassSliderProps> = ({
  onComplete,
  title,
  icon = "arrow-forward",
  endIcon,
  gradient = [glassColors.accent.primary, glassColors.accent.secondary],
  disabled = false,
  width = SCREEN_WIDTH - 48,
}) => {
  const [completed, setCompleted] = useState(false);
  const [thumbPos, setThumbPos] = useState(0);

  // Animation values
  const translateX = useSharedValue(0);
  const thumbScale = useSharedValue(1);
  const isDragging = useSharedValue(0);

  const MAX_SLIDE = width - THUMB_SIZE - PADDING * 2;

  // Font loading
  const font = matchFont({
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontSize: 17,
    fontWeight: "600",
  });

  // Completion handler
  const handleCompleteJS = () => {
    if (!completed && !disabled) {
      setCompleted(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onComplete();
    }
  };

  // Sync SharedValue to React State for Skia Shader
  useAnimatedReaction(
    () => translateX.value,
    (currentValue) => {
      runOnJS(setThumbPos)(currentValue);
      if (currentValue >= MAX_SLIDE && !completed) {
        runOnJS(handleCompleteJS)();
      }
    }
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !completed && !disabled,
      onMoveShouldSetPanResponder: () => !completed && !disabled,
      onPanResponderGrant: () => {
        isDragging.value = 1;
        thumbScale.value = withSpring(0.9);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, Math.min(gestureState.dx, MAX_SLIDE));
        translateX.value = newValue;
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.value = 0;
        thumbScale.value = withSpring(1);
        const progress = gestureState.dx / MAX_SLIDE;

        if (progress > 0.85) {
          translateX.value = withSpring(MAX_SLIDE, { damping: 20 });
        } else {
          translateX.value = withSpring(0, { damping: 20 });
        }
      },
    })
  ).current;

  // Create Filter Object imperatively
  const textFilter = useMemo(() => {
    if (!distortionShaderSource) return undefined;
    const builder = Skia.RuntimeShaderBuilder(distortionShaderSource);
    builder.setUniform("thumbPos", [thumbPos + THUMB_SIZE / 2 + PADDING, SLIDER_HEIGHT / 2]);
    builder.setUniform("radius", [80]);
    builder.setUniform("strength", [30]);

    return Skia.ImageFilter.MakeRuntimeShader(builder, "image", null);
  }, [thumbPos]);

  // Derived Values become Animated Styles
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: thumbScale.value }
      ]
    };
  });

  const startIconStyle = useAnimatedStyle(() => {
    const progress = MAX_SLIDE > 0 ? translateX.value / MAX_SLIDE : 0;
    // Start fading out immediately, fully gone by 20%
    return {
      opacity: 1 - Math.min(1, Math.max(0, progress * 5.0))
    };
  });

  const endIconStyle = useAnimatedStyle(() => {
    const progress = MAX_SLIDE > 0 ? translateX.value / MAX_SLIDE : 0;
    // Start fading in immediately, fully visible by 20%
    return {
      opacity: Math.min(1, Math.max(0, progress * 5.0))
    };
  });

  // Calculate text position to center it
  const textX = useMemo(() => {
    if (!font) return 0;
    const textWidth = font.getTextWidth(title);
    return (width - textWidth) / 2 + 10;
  }, [font, title, width]);

  const textY = SLIDER_HEIGHT / 2 + 6;

  if (!font) {
    return <View style={{ height: SLIDER_HEIGHT }} />;
  }

  return (
    <View style={[styles.container, { width, height: SLIDER_HEIGHT }]}>
      {/* Skia Canvas Layer - Background & Text */}
      <Canvas style={StyleSheet.absoluteFill}>
        {/* 1. Liquid Glass Track Background */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={SLIDER_HEIGHT}
          r={SLIDER_HEIGHT / 2}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, SLIDER_HEIGHT)}
            colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)"]}
          />
          <Blur blur={10} />
        </RoundedRect>

        {/* Track Stroke */}
        <RoundedRect
          x={1}
          y={1}
          width={width - 2}
          height={SLIDER_HEIGHT - 2}
          r={SLIDER_HEIGHT / 2}
          style="stroke"
          strokeWidth={1}
          color="rgba(255,255,255,0.3)"
        />

        {/* 2. Text Content */}

        {/* Fallback Text (No Distortion) - Ensures visibility */}
        <Text
          x={textX}
          y={textY}
          text={title}
          font={font}
          color="white"
          opacity={0.8}
        />

        {/* Distorted Text Layer */}
        <Group
          layer={
            textFilter ? (
              <Paint>
                <ImageFilter filter={textFilter} />
              </Paint>
            ) : undefined
          }
        >
          <Text
            x={textX}
            y={textY}
            text={title}
            font={font}
            color="white"
            opacity={1.0}
          >
            <BoxShadow dx={0} dy={1} blur={2} color="rgba(0,0,0,0.5)" />
          </Text>

          <Text
            x={textX + font.getTextWidth(title) + 12}
            y={textY}
            text=">>>"
            font={font}
            color="rgba(255,255,255,0.7)"
            style="stroke"
            strokeWidth={2}
          />
        </Group>
      </Canvas>

      {/* Touch Handler & Thumb Overlay */}
      {/* We use a transparent view logic but render the visual thumb here? 
          Actually, let's render the visual thumb in React Native View on top 
          so we can use Ionicons easily, as requested. 
          The Request was "make the icon transparent so we can see interaction". 
      */}

      <Animated.View
        style={[
          styles.thumbContainer,
          thumbAnimatedStyle,
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.glassThumb}>
          {/* Extremely subtle glass gradient for the thumb */}
          <View style={styles.thumbGlassOverlay} />

          {/* Start Icon (Fades Out) */}
          <Animated.View style={[styles.iconContainer, startIconStyle]}>
            <Ionicons name={icon} size={28} color="rgba(255,255,255,0.9)" />
          </Animated.View>

          {/* End Icon (Fades In) - Optional */}
          {endIcon && (
            <Animated.View style={[styles.iconContainer, StyleSheet.absoluteFill, endIconStyle]}>
              <Ionicons name={endIcon} size={28} color="rgba(255,255,255,0.9)" />
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SLIDER_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  thumbContainer: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    zIndex: 10,
  },
  glassThumb: {
    flex: 1,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Minimal styling to be "transparent" but visible as an interactive object
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.1)', // Very transparent
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default GlassSlider;
