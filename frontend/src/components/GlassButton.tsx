import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  liquidGlassColors,
  liquidShadow,
  squircle,
  glassColors,
  glassShadow,
  radius,
} from '../theme/glass';
import { typography } from '../theme/typography';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
}

const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  style,
  textStyle,
  gradient,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 16 },
    medium: { paddingVertical: 16, paddingHorizontal: 24 },
    large: { paddingVertical: 20, paddingHorizontal: 32 },
  };

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const fontSize = {
    small: 14,
    medium: 16,
    large: 18,
  };

  const getGradientColors = () => {
    if (gradient) return gradient;
    switch (variant) {
      case 'primary':
        return [glassColors.accent.primary, glassColors.accent.secondary];
      case 'secondary':
        return ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'];
      case 'ghost':
        return ['transparent', 'transparent'];
      case 'glass':
        return ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.3)'];
      default:
        return [glassColors.accent.primary, glassColors.accent.secondary];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
      case 'ghost':
      case 'glass':
        return glassColors.text.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getShadow = () => {
    if (variant === 'primary') return glassShadow.glow;
    if (variant === 'glass') return glassShadow.soft;
    return {};
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize[size]}
              color={getTextColor()}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              { fontSize: fontSize[size], color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize[size]}
              color={getTextColor()}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.container,
          sizeStyles[size],
          getShadow(),
          variant === 'ghost' && styles.ghostBorder,
          variant === 'glass' && styles.glassBorder,
          disabled && styles.disabled,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {variant === 'glass' && Platform.OS !== 'web' && (
          <BlurView
            intensity={50}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Top shine effect */}
        {variant === 'primary' && <View style={styles.shine} />}
        {renderContent()}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  ghostBorder: {
    borderWidth: 1.5,
    borderColor: glassColors.border.medium,
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: glassColors.border.light,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassButton;
