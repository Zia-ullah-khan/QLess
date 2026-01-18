import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import {
  Canvas,
  Skia,
  BackdropFilter,
  Fill,
  rect,
  rrect,
  TileMode,
  Group,
  RoundedRect,
  Blur,
  ColorMatrix,
  Paint,
  LinearGradient,
  vec,
  ImageFilter,
} from "@shopify/react-native-skia";
import { squircle } from "../theme/glass";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Shader2 Logic adapted for SkiaLiquidGlass
// This shader logic includes liquid refraction, chromatic aberration, and roughness
const liquidGlassLogic = `
uniform float2 resolution;
uniform float4 bounds;
uniform float radius;
uniform float thickness;
uniform float ior;
uniform float time;
uniform shader blurredImage; // Input shader from MakeRuntimeShaderWithChildren

// Shape function for rounded box
float sdRoundedBox(float2 p, float2 b, float r) {
  float2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// SDF for the card shape
float sdf(float2 p) {
  float2 center = bounds.xy + bounds.zw * 0.5;
  float2 halfSize = bounds.zw * 0.5;
  return sdRoundedBox(p - center, halfSize, radius);
}

// Gradient calculation for normal map
float2 calculateGradient(float2 p) {
  float eps = 1.0;
  float dx = sdf(p + float2(eps, 0.0)) - sdf(p - float2(eps, 0.0));
  float dy = sdf(p + float2(0.0, eps)) - sdf(p - float2(0.0, eps));
  return normalize(float2(dx, dy));
}

float3 getNormal(float sd, float2 gradient, float t) {
  float n_cos = clamp((t + sd) / t, 0.0, 1.0);
  float n_sin = sqrt(1.0 - n_cos * n_cos);
  return normalize(float3(gradient.x * n_cos, gradient.y * n_cos, n_sin));
}

float getHeight(float sd, float t) {
  if (sd >= 0.0) return 0.0;
  if (sd < -t) return t;
  float x = t + sd;
  return sqrt(t * t - x * x);
}

half4 main(float2 fragCoord) {
  float d = sdf(fragCoord);
  
  // Return transparent if outside the shape
  if (d > 0.0) {
    return half4(0.0);
  }
  
  float2 g = calculateGradient(fragCoord);
  float3 normal = getNormal(d, g, thickness);
  float3 incident = float3(0.0, 0.0, -1.0);
  
  // Fresnel effect
  float fresnel = pow(1.0 - abs(dot(incident, normal)), 3.0);
  
  // Refraction
  float3 refractVec = refract(incident, normal, 1.0 / ior);
  float h = getHeight(d, thickness);
  float baseHeight = thickness * 5.0; // Multiplier for visual depth
  float refractLen = (h + baseHeight) / max(0.001, abs(refractVec.z));
  
  // Chromatic Aberration
  float chromaticAberration = 0.03;
  vec2 baseOffset = refractVec.xy * refractLen; // Pixel offset
  vec2 uvBase = (fragCoord + baseOffset) / resolution.xy; // Normalized UV
  
  // Sample blurred background with chromatic offset
  vec2 chromaOffset = refractVec.xy * chromaticAberration; // Normalized UV offset
  
  // Sample background using blurredImage input
  // Note: Skia shader coords are in pixels.
  
  float r = blurredImage.eval(fragCoord + baseOffset - chromaOffset * resolution.xy).r;
  float gChannel = blurredImage.eval(fragCoord + baseOffset).g;
  float b = blurredImage.eval(fragCoord + baseOffset + chromaOffset * resolution.xy).b;
  
  vec4 refractColor = vec4(r, gChannel, b, 1.0);
  
  // Reflection/Specularity
  float3 lightDir = normalize(float3(-0.5, -0.8, 1.0));
  float3 reflectVec = reflect(-lightDir, normal);
  float specular = pow(max(0.0, dot(reflectVec, -incident)), 32.0);
  
  // Edge Glow/Highlight
  float edgeGlow = smoothstep(-8.0, 0.0, d) * (1.0 - smoothstep(-2.0, 0.0, d));
  
  // Composition
  vec4 glassColor = refractColor;
  
  // Add Specular Highlights
  glassColor.rgb += (specular + edgeGlow * 0.5) * 0.5;
  
  // Add a subtle white tint for "glass" feeling
  glassColor = mix(glassColor, vec4(1.0), 0.1 + fresnel * 0.2);
  
  // Ensure alpha is 1 inside the shape
  glassColor.a = 1.0;
  
  return glassColor;
}
`;

const liquidRuntimeEffect = Skia.RuntimeEffect.Make(liquidGlassLogic);

export interface SkiaLiquidGlassProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  borderRadius?: number;
  blurIntensity?: number;
  tintOpacity?: number;
  glassThickness?: number;
  indexOfRefraction?: number;
  saturation?: number;
  highlightIntensity?: number;
  enableShimmer?: boolean;
  animated?: boolean;
  style?: any;
  isDarkMode?: boolean;
}

const SkiaLiquidGlass: React.FC<SkiaLiquidGlassProps> = ({
  children,
  width: propWidth,
  height: propHeight = 200,
  borderRadius = squircle.xl,
  blurIntensity = 25,
  glassThickness = 20,
  indexOfRefraction = 1.5,
  animated = true,
  style,
}) => {
  const containerWidth = propWidth || SCREEN_WIDTH - 48;
  const containerHeight = propHeight;
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let startTime = Date.now();
    let frameId: number;

    const loop = () => {
      setTime((Date.now() - startTime) / 1000);
      frameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frameId);
  }, [animated]);

  const backdropFilter = useMemo(() => {
    if (!liquidRuntimeEffect) return null;

    const builder = Skia.RuntimeShaderBuilder(liquidRuntimeEffect);

    // Set Uniforms
    builder.setUniform("resolution", [containerWidth, containerHeight]);
    builder.setUniform("bounds", [0, 0, containerWidth, containerHeight]); // x, y, w, h locally
    builder.setUniform("radius", [borderRadius]);
    builder.setUniform("thickness", [glassThickness]);
    builder.setUniform("ior", [indexOfRefraction]);
    builder.setUniform("time", [time]);

    // Create the filter chain: Blur -> Custom Shader
    // using "blurredImage" as the uniform name for the input child
    return Skia.ImageFilter.MakeRuntimeShaderWithChildren(
      builder,
      0,
      ["blurredImage"],
      [Skia.ImageFilter.MakeBlur(blurIntensity, blurIntensity, TileMode.Clamp)]
    );
  }, [containerWidth, containerHeight, borderRadius, glassThickness, indexOfRefraction, time, blurIntensity]);

  const clipPath = useMemo(() => {
    const path = Skia.Path.Make();
    path.addRRect(rrect(rect(0, 0, containerWidth, containerHeight), borderRadius, borderRadius));
    return path;
  }, [containerWidth, containerHeight, borderRadius]);

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight, borderRadius: borderRadius }, style]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group clip={clipPath}>
          {backdropFilter && (
            <BackdropFilter
              filter={<ImageFilter filter={backdropFilter} />}
            >
              <Fill color="transparent" />
            </BackdropFilter>
          )}
        </Group>
      </Canvas>

      <View style={styles.contentContainer} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
};

// Restoring SkiaGlassCard for compatibility/fallback usage
export const SkiaGlassCard: React.FC<{
  children?: React.ReactNode;
  width?: number;
  height?: number;
  borderRadius?: number;
  blur?: number;
  tintOpacity?: number;
  style?: any;
  isDarkMode?: boolean;
}> = ({
  children,
  width: propWidth,
  height = 120,
  borderRadius = squircle.lg,
  blur = 20,
  tintOpacity = 0.25,
  style,
  isDarkMode = false,
}) => {
    const cardWidth = propWidth || SCREEN_WIDTH - 48;

    const glassColor = isDarkMode
      ? `rgba(255, 255, 255, ${tintOpacity * 0.4})`
      : `rgba(255, 255, 255, ${tintOpacity})`;

    const borderColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(255, 255, 255, 0.6)';

    const clipPath = useMemo(() => {
      const path = Skia.Path.Make();
      path.addRRect(rrect(rect(0, 0, cardWidth, height), borderRadius, borderRadius));
      return path;
    }, [cardWidth, height, borderRadius]);

    return (
      <View style={[styles.container, { width: cardWidth, height, borderRadius }, style]}>
        <Canvas style={styles.canvas}>
          <Group clip={clipPath}>
            <BackdropFilter filter={<Blur blur={blur} />}>
              <RoundedRect
                x={0}
                y={0}
                width={cardWidth}
                height={height}
                r={borderRadius}
              />
            </BackdropFilter>
            <RoundedRect
              x={0}
              y={0}
              width={cardWidth}
              height={height}
              r={borderRadius}
              color={glassColor}
            />
            <RoundedRect
              x={0}
              y={0}
              width={cardWidth}
              height={height * 0.45}
              r={borderRadius}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, height * 0.45)}
                colors={[
                  isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.4)',
                  'rgba(255, 255, 255, 0)',
                ]}
              />
            </RoundedRect>

            <RoundedRect
              x={0.5}
              y={0.5}
              width={cardWidth - 1}
              height={height - 1}
              r={borderRadius - 0.5}
              color="transparent"
              style="stroke"
              strokeWidth={1.5}
            >
              <Paint color={borderColor} />
            </RoundedRect>
          </Group>
        </Canvas>

        <View style={styles.contentContainer} pointerEvents="box-none">
          {children}
        </View>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SkiaLiquidGlass;
