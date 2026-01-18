import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Canvas, Fill, Skia, Shader } from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

const liquidBackgroundShader = Skia.RuntimeEffect.Make(`
uniform float2 resolution;
uniform float time;

// Smooth minimum function for blending shapes (metaballs)
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
  return mix(a, b, h) - k * h * (1.0 - h);
}

// Signed distance for a circle
float sdCircle(vec2 p, vec2 center, float radius) {
  return length(p - center) - radius;
}

vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263, 0.416, 0.557); // Teal/Blueish palette
  return a + b * cos(6.28318 * (c * t + d));
}

half4 main(vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  
  // Animate blobs
  float t = time * 0.5;
  
  // Blob 1
  vec2 c1 = vec2(sin(t) * 0.5, cos(t * 0.7) * 0.5);
  float d1 = sdCircle(uv, c1, 0.4);
  
  // Blob 2
  vec2 c2 = vec2(cos(t * 0.6) * 0.6, sin(t * 0.8) * 0.6);
  float d2 = sdCircle(uv, c2, 0.35);
  
  // Blob 3 (Mouse/Iteractive or just chaos)
  vec2 c3 = vec2(sin(t * 1.2 + 2.0) * 0.4, cos(t * 1.5) * 0.4);
  float d3 = sdCircle(uv, c3, 0.3);
  
  // Blend them
  float k = 0.6; // Blending smoothness
  float d = smin(d1, d2, k);
  d = smin(d, d3, k);
  
  // Visuals
  vec3 col = palette(length(uv) + d * 0.4 + time * 0.2);
  
  // Create a liquid-like contour/gradient
  d = sin(d * 8.0 + time) / 8.0;
  d = abs(d);
  
  // Smooth edges
  d = 0.02 / d;
  
  col *= d;
  
  // Background gradient mix
  vec3 bgCol = vec3(0.05, 0.02, 0.1); // Dark background
  vec3 finalColor = mix(bgCol, col, 0.6); // Mix blobs with dark bg
  
  return half4(finalColor, 1.0);
}
`);

const LiquidBackground = () => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let startTime = Date.now();
        let frameId: number;

        const loop = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            setTime(elapsed);
            frameId = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(frameId);
    }, []);

    const uniforms = useMemo(
        () => ({
            resolution: [width, height],
            time: [time], // Wrapped in array for Skia consistency
        }),
        [time]
    );

    if (!liquidBackgroundShader) {
        return <View style={StyleSheet.absoluteFill} />;
    }

    return (
        <Canvas style={StyleSheet.absoluteFill}>
            <Fill>
                <Shader source={liquidBackgroundShader} uniforms={uniforms} />
            </Fill>
        </Canvas>
    );
};

export default LiquidBackground;
