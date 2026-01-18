import { Platform, ViewStyle, TextStyle } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════════
// APPLE LIQUID GLASS DESIGN SYSTEM - iOS 26 / visionOS
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Four-Layer Architecture:
// Layer 1: Refraction (Blur + Saturation vibrancy)
// Layer 2: Material Surface (Dynamic tint with opacity)
// Layer 3: Specular Edge (Hairline stroke + inner glow)
// Layer 4: Vibrant Content (Text and icons with vibrancy colors)
//
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ADAPTATION STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface LiquidGlassConfig {
  isDarkMode: boolean;
  glassOpacity: number; // 0-1 range for dynamic adaptation
}

export const defaultGlassConfig: LiquidGlassConfig = {
  isDarkMode: false,
  glassOpacity: 0.72,
};

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2: MATERIAL SURFACE - Dynamic Tint Colors
// ─────────────────────────────────────────────────────────────────────────────

// Light mode uses higher opacity (0.6-0.8) to let light wallpapers shine
// Dark mode uses lower opacity (0.05-0.15) to let dark wallpapers through
export const getMaterialTint = (isDarkMode: boolean, opacity?: number) => {
  if (isDarkMode) {
    const darkOpacity = opacity ?? 0.08;
    return `rgba(255, 255, 255, ${darkOpacity})`;
  }
  const lightOpacity = opacity ?? 0.72;
  return `rgba(255, 255, 255, ${lightOpacity})`;
};

export const liquidGlassColors = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MATERIAL SURFACE TINTS
  // ═══════════════════════════════════════════════════════════════════════════
  material: {
    // Light mode materials
    light: {
      primary: 'rgba(255, 255, 255, 0.72)',      // Primary glass surface
      secondary: 'rgba(255, 255, 255, 0.55)',    // Secondary glass
      tertiary: 'rgba(255, 255, 255, 0.35)',     // Subtle glass
      elevated: 'rgba(255, 255, 255, 0.85)',     // Elevated glass (modals)
      ultraThin: 'rgba(255, 255, 255, 0.25)',    // Ultra-thin overlay
    },
    // Dark mode materials  
    dark: {
      primary: 'rgba(255, 255, 255, 0.08)',      // Dark primary glass
      secondary: 'rgba(255, 255, 255, 0.05)',    // Dark secondary glass
      tertiary: 'rgba(255, 255, 255, 0.03)',     // Dark subtle glass
      elevated: 'rgba(255, 255, 255, 0.12)',     // Dark elevated glass
      ultraThin: 'rgba(255, 255, 255, 0.02)',    // Dark ultra-thin
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYER 3: SPECULAR EDGE - Hairline Strokes
  // ═══════════════════════════════════════════════════════════════════════════
  specular: {
    // Top-left highlight (simulates light source)
    highlight: 'rgba(255, 255, 255, 0.45)',
    highlightStrong: 'rgba(255, 255, 255, 0.65)',
    // Ambient glow
    glow: 'rgba(255, 255, 255, 0.25)',
    // Edge borders
    edgeLight: 'rgba(255, 255, 255, 0.5)',
    edgeMedium: 'rgba(255, 255, 255, 0.3)',
    edgeSubtle: 'rgba(255, 255, 255, 0.15)',
    // Dark mode edges
    edgeDark: 'rgba(255, 255, 255, 0.08)',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCENT COLORS (with Apple-inspired vibrancy)
  // ═══════════════════════════════════════════════════════════════════════════
  accent: {
    primary: '#6366F1',     // Indigo - Primary brand color
    secondary: '#8B5CF6',   // Violet - Secondary accent
    tertiary: '#EC4899',    // Pink - Tertiary accent
    cyan: '#06B6D4',        // Cyan - Info/highlight
    emerald: '#10B981',     // Emerald - Success
    amber: '#F59E0B',       // Amber - Warning
    rose: '#F43F5E',        // Rose - Error/destructive
    blue: '#3B82F6',        // Blue - Links/actions
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRADIENT PAIRS for Liquid Glass Effect
  // ═══════════════════════════════════════════════════════════════════════════
  gradients: {
    // Glass surface gradients
    glassLight: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.5)'],
    glassDark: ['rgba(40, 40, 55, 0.95)', 'rgba(25, 25, 40, 0.85)'],
    glassUltra: ['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.75)'],
    
    // Accent gradients
    accent: ['#6366F1', '#8B5CF6'],
    accentWarm: ['#F472B6', '#EC4899'],
    accentCool: ['#06B6D4', '#6366F1'],
    accentVibrant: ['#6366F1', '#EC4899'],
    
    // Aurora mesh gradient (for backgrounds)
    aurora: ['#6366F1', '#8B5CF6', '#EC4899'],
    sunrise: ['#F59E0B', '#EF4444', '#EC4899'],
    ocean: ['#06B6D4', '#3B82F6', '#6366F1'],
    
    // Liquid displacement highlight
    liquidShimmer: ['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent'],
    liquidGlow: ['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.15)'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYER 4: VIBRANT CONTENT - Text & Icon Colors
  // ═══════════════════════════════════════════════════════════════════════════
  vibrant: {
    // Light mode text (high-contrast for readability)
    light: {
      primary: '#1A1A2E',                    // Almost black
      secondary: 'rgba(26, 26, 46, 0.70)',   // 70% opacity
      tertiary: 'rgba(26, 26, 46, 0.50)',    // 50% opacity
      quaternary: 'rgba(26, 26, 46, 0.35)',  // Subtle
      accent: '#6366F1',                     // Accent color
    },
    // Dark mode text (white with vibrancy)
    dark: {
      primary: 'rgba(255, 255, 255, 0.92)',  // text-white/90
      secondary: 'rgba(255, 255, 255, 0.70)', // 70% white
      tertiary: 'rgba(255, 255, 255, 0.50)', // 50% white
      quaternary: 'rgba(255, 255, 255, 0.35)', // Subtle white
      accent: '#818CF8',                     // Lighter indigo for dark mode
    },
    // Pure colors (non-adaptive)
    pure: {
      white: '#FFFFFF',
      black: '#000000',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHADOW COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  shadow: {
    color: 'rgba(99, 102, 241, 0.25)',     // Accent-tinted shadow
    colorDark: 'rgba(0, 0, 0, 0.25)',      // Pure dark shadow
    colorLight: 'rgba(255, 255, 255, 0.8)', // Light shadow (for dark mode)
    colorSubtle: 'rgba(0, 0, 0, 0.08)',    // Very subtle shadow
  },
};

// Legacy alias for backward compatibility
export const glassColors = {
  background: {
    primary: liquidGlassColors.material.light.primary,
    secondary: liquidGlassColors.material.light.secondary,
    tertiary: liquidGlassColors.material.light.tertiary,
    dark: liquidGlassColors.material.dark.elevated,
    darkSecondary: liquidGlassColors.material.dark.secondary,
  },
  accent: liquidGlassColors.accent,
  gradients: liquidGlassColors.gradients,
  border: {
    light: liquidGlassColors.specular.edgeLight,
    medium: liquidGlassColors.specular.edgeMedium,
    subtle: liquidGlassColors.specular.edgeSubtle,
    dark: 'rgba(0, 0, 0, 0.1)',
    accent: 'rgba(99, 102, 241, 0.4)',
  },
  text: {
    primary: liquidGlassColors.vibrant.light.primary,
    secondary: liquidGlassColors.vibrant.light.secondary,
    tertiary: liquidGlassColors.vibrant.light.tertiary,
    light: liquidGlassColors.vibrant.pure.white,
    lightSecondary: liquidGlassColors.vibrant.dark.secondary,
    accent: liquidGlassColors.accent.primary,
  },
  shadow: liquidGlassColors.shadow,
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1: REFRACTION - Blur Intensity Settings
// ═══════════════════════════════════════════════════════════════════════════════

// Apple's liquid glass uses backdrop-blur: 25px with saturate: 180%
// In React Native, we use expo-blur with these approximate values
export const liquidBlur = {
  // Blur intensities (maps to expo-blur intensity)
  ultraThin: 20,      // Very subtle blur
  thin: 40,           // Light blur
  regular: 60,        // Standard glass blur
  thick: 80,          // Strong blur
  ultraThick: 100,    // Maximum blur
  
  // Platform-specific defaults
  default: Platform.select({
    ios: 60,
    android: 80,
    default: 70,
  }) as number,
};

// Legacy alias
export const blurIntensity = liquidBlur.default;

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3: SPECULAR EDGE STYLES (Hairline Stroke Implementation)
// ═══════════════════════════════════════════════════════════════════════════════

// Apple uses: 
// - inset 1px 1px 0 rgba(255,255,255,0.45) for top-left highlight
// - inset 0 0 5px rgba(255,255,255,0.45) for ambient glow
// Since React Native doesn't support inset shadows, we simulate with borders and overlay views

export const specularEdge = {
  // Hairline stroke (0.5pt-style border)
  hairline: {
    borderWidth: 1,
    borderColor: liquidGlassColors.specular.edgeLight,
  } as ViewStyle,
  
  // Strong hairline for elevated surfaces
  hairlineStrong: {
    borderWidth: 1,
    borderColor: liquidGlassColors.specular.highlightStrong,
  } as ViewStyle,
  
  // Subtle hairline for nested elements
  hairlineSubtle: {
    borderWidth: 0.5,
    borderColor: liquidGlassColors.specular.edgeSubtle,
  } as ViewStyle,
  
  // Dark mode hairline
  hairlineDark: {
    borderWidth: 1,
    borderColor: liquidGlassColors.specular.edgeDark,
  } as ViewStyle,
  
  // Inner highlight simulation (top border emphasis)
  innerHighlight: {
    borderTopWidth: 1,
    borderTopColor: liquidGlassColors.specular.highlight,
    borderLeftWidth: 0.5,
    borderLeftColor: liquidGlassColors.specular.glow,
  } as ViewStyle,
};

// ═══════════════════════════════════════════════════════════════════════════════
// APPLE SQUIRCLE - Continuous Curves
// ═══════════════════════════════════════════════════════════════════════════════

// Apple uses "continuous" rounded corners (superellipse/squircle)
// iOS natively supports this, Android uses large radius values
export const squircle = {
  xs: 8,       // Small chips/badges
  sm: 12,      // Small buttons
  md: 16,      // Medium elements
  lg: 20,      // Cards
  xl: 24,      // Large cards
  xxl: 32,     // Modals/sheets (rounded-[2rem])
  full: 40,    // Very large (rounded-[2.5rem])
  pill: 9999,  // Pill shape (rounded-[5rem] equivalent)
};

// Legacy alias
export const radius = squircle;

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS SURFACE STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const liquidSurface = {
  // Primary glass surface (cards, panels)
  primary: {
    backgroundColor: liquidGlassColors.material.light.primary,
    ...specularEdge.hairline,
    borderRadius: squircle.xl,
    overflow: 'hidden',
  } as ViewStyle,
  
  // Secondary glass surface
  secondary: {
    backgroundColor: liquidGlassColors.material.light.secondary,
    ...specularEdge.hairlineSubtle,
    borderRadius: squircle.lg,
    overflow: 'hidden',
  } as ViewStyle,
  
  // Elevated glass surface (modals, popovers)
  elevated: {
    backgroundColor: liquidGlassColors.material.light.elevated,
    ...specularEdge.hairlineStrong,
    borderRadius: squircle.xxl,
    overflow: 'hidden',
  } as ViewStyle,
  
  // Ultra-thin glass overlay
  ultraThin: {
    backgroundColor: liquidGlassColors.material.light.ultraThin,
    ...specularEdge.hairlineSubtle,
    borderRadius: squircle.lg,
    overflow: 'hidden',
  } as ViewStyle,
};

// Dark mode surfaces
export const liquidSurfaceDark = {
  primary: {
    backgroundColor: liquidGlassColors.material.dark.primary,
    ...specularEdge.hairlineDark,
    borderRadius: squircle.xl,
    overflow: 'hidden',
  } as ViewStyle,
  
  secondary: {
    backgroundColor: liquidGlassColors.material.dark.secondary,
    ...specularEdge.hairlineDark,
    borderRadius: squircle.lg,
    overflow: 'hidden',
  } as ViewStyle,
  
  elevated: {
    backgroundColor: liquidGlassColors.material.dark.elevated,
    ...specularEdge.hairlineDark,
    borderRadius: squircle.xxl,
    overflow: 'hidden',
  } as ViewStyle,
};

// Legacy aliases
export const glassSurface = liquidSurface.primary;
export const glassSurfaceSubtle = liquidSurface.secondary;
export const glassSurfaceDark = liquidSurfaceDark.primary;

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOW PRESETS (for Glass Elevation)
// ═══════════════════════════════════════════════════════════════════════════════

export const liquidShadow = {
  // Soft shadow (default for glass cards)
  soft: {
    shadowColor: liquidGlassColors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
  
  // Medium shadow (elevated cards)
  medium: {
    shadowColor: liquidGlassColors.shadow.color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  } as ViewStyle,
  
  // Strong shadow (modals, popovers)
  strong: {
    shadowColor: liquidGlassColors.shadow.colorDark,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 16,
  } as ViewStyle,
  
  // Glow shadow (accent elements)
  glow: {
    shadowColor: liquidGlassColors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  } as ViewStyle,
  
  // Subtle shadow (nested elements)
  subtle: {
    shadowColor: liquidGlassColors.shadow.colorSubtle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  
  // Lift shadow (hover/press state)
  lift: {
    shadowColor: liquidGlassColors.shadow.colorDark,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 14,
  } as ViewStyle,
};

// Legacy alias
export const glassShadow = liquidShadow;

// ═══════════════════════════════════════════════════════════════════════════════
// HOVER/INTERACTION STATES
// ═══════════════════════════════════════════════════════════════════════════════

// When user interacts, glass should "materialize" (increase opacity/brightness)
// or "lift" (apply soft outer shadow)
export const liquidInteraction = {
  // Materialize: increase opacity for active state
  materialize: {
    opacity: 1,
    backgroundColor: liquidGlassColors.material.light.elevated,
  } as ViewStyle,
  
  // Lift: add shadow for hover/focus
  lift: {
    ...liquidShadow.lift,
    transform: [{ translateY: -2 }],
  } as ViewStyle,
  
  // Press: slight scale down
  press: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  } as ViewStyle,
  
  // Glow: accent glow for selected state
  glowActive: {
    ...liquidShadow.glow,
    borderColor: liquidGlassColors.accent.primary,
    borderWidth: 2,
  } as ViewStyle,
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLASS BUTTON STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const liquidButton = {
  primary: {
    backgroundColor: liquidGlassColors.accent.primary,
    borderRadius: squircle.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    ...liquidShadow.glow,
  } as ViewStyle,
  
  secondary: {
    ...liquidSurface.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
  } as ViewStyle,
  
  ghost: {
    backgroundColor: 'transparent',
    ...specularEdge.hairline,
    borderRadius: squircle.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
  } as ViewStyle,
  
  glass: {
    ...liquidSurface.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    ...liquidShadow.soft,
  } as ViewStyle,
};

// Legacy alias
export const glassButton = liquidButton;

// ═══════════════════════════════════════════════════════════════════════════════
// GLASS CARD STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const liquidCard = {
  container: {
    ...liquidSurface.primary,
    padding: 20,
    ...liquidShadow.soft,
  } as ViewStyle,
  
  elevated: {
    ...liquidSurface.elevated,
    padding: 24,
    ...liquidShadow.medium,
  } as ViewStyle,
  
  interactive: {
    ...liquidSurface.secondary,
    padding: 16,
    ...liquidShadow.subtle,
  } as ViewStyle,
  
  // Stacked card styles (for merging effect)
  stacked: {
    ...liquidSurface.primary,
    padding: 16,
    ...liquidShadow.soft,
    marginBottom: -12, // Negative margin for overlap
  } as ViewStyle,
};

// Legacy alias
export const glassCard = liquidCard;

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const liquidInput: ViewStyle = {
  backgroundColor: liquidGlassColors.material.light.secondary,
  ...specularEdge.hairlineSubtle,
  borderRadius: squircle.md,
  paddingHorizontal: 16,
  paddingVertical: 14,
};

// Legacy alias
export const glassInput = liquidInput;

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID ANIMATION CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════

// Spring config for liquid/fluid animations
export const liquidSpring = {
  // Standard liquid motion
  default: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  // Bouncy liquid motion
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.7,
  },
  // Gentle liquid motion
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },
  // Snappy liquid motion
  snappy: {
    damping: 18,
    stiffness: 200,
    mass: 0.6,
  },
};

// Timing config for liquid transitions
export const liquidTiming = {
  fast: 200,      // Quick transitions
  default: 350,   // Standard transitions
  slow: 500,      // Deliberate transitions
  
  // Displacement animation timing
  displacement: {
    duration: 600,
    delay: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPACING SYSTEM (8pt Grid)
// ═══════════════════════════════════════════════════════════════════════════════

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get adaptive colors based on dark mode state
 */
export const getAdaptiveColors = (isDarkMode: boolean) => ({
  material: isDarkMode 
    ? liquidGlassColors.material.dark 
    : liquidGlassColors.material.light,
  vibrant: isDarkMode 
    ? liquidGlassColors.vibrant.dark 
    : liquidGlassColors.vibrant.light,
  specular: isDarkMode
    ? { ...liquidGlassColors.specular, edge: liquidGlassColors.specular.edgeDark }
    : liquidGlassColors.specular,
});

/**
 * Get surface style based on dark mode and variant
 */
export const getSurfaceStyle = (
  isDarkMode: boolean,
  variant: 'primary' | 'secondary' | 'elevated' | 'ultraThin' = 'primary'
): ViewStyle => {
  const surfaces = isDarkMode ? liquidSurfaceDark : liquidSurface;
  return surfaces[variant] || surfaces.primary;
};

/**
 * Get vibrant text color based on dark mode and emphasis
 */
export const getVibrantText = (
  isDarkMode: boolean,
  emphasis: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'accent' = 'primary'
): string => {
  const colors = isDarkMode 
    ? liquidGlassColors.vibrant.dark 
    : liquidGlassColors.vibrant.light;
  return colors[emphasis];
};
