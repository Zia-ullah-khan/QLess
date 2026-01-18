import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../context/CartContext';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius } from '../theme/glass';

// Product images mapping
const productImages: Record<string, ImageSourcePropType> = {
  'nike-af1-goretex-vibram': require('../../assets/products/Nike/Air Force 1 GORE-TEX Vibram.png'),
  'nike-aj1-low-g': require('../../assets/products/Nike/Air Jordan 1 Low G.png'),
  'nike-solo-swoosh': require('../../assets/products/Nike/Nike Solo Swoosh.png'),
};

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
  index: number;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
  index,
}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove();
    });
  };

  const itemTotal = (item.price * item.quantity).toFixed(2);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Glass background */}
      {Platform.OS !== 'web' && (
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.75)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Top highlight */}
      <View style={styles.topHighlight} />

      <View style={styles.content}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {(item.image && (item.image.startsWith('http') || item.image.startsWith('https'))) ? (
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (item.image && productImages[item.image]) ? (
            <Image
              source={productImages[item.image]}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <LinearGradient
              colors={[glassColors.accent.primary, glassColors.accent.secondary]}
              style={styles.imagePlaceholder}
            >
              <Ionicons name="cube" size={24} color="#FFFFFF" />
            </LinearGradient>
          )}
        </View>

        {/* Item Details */}
        <View style={styles.details}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            {item.quantity > 1 && (
              <Text style={styles.itemTotal}>× {item.quantity} = ${itemTotal}</Text>
            )}
          </View>
        </View>

        {/* Quantity Controls */}
        <View style={styles.controls}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.quantity - 1)}
            >
              <Ionicons name="remove" size={18} color={glassColors.accent.primary} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
            >
              <Ionicons name="add" size={18} color={glassColors.accent.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
    ...glassShadow.soft,
  },
  productImage: {
    width: 56,
    height: 56,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    ...typography.headline,
    color: glassColors.text.primary,
    marginBottom: 6,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemPrice: {
    fontSize: 16,
    ...typography.headline,
    color: glassColors.accent.primary,
  },
  itemTotal: {
    fontSize: 13,
    ...typography.body,
    color: glassColors.text.tertiary,
    marginLeft: 6,
  },
  controls: {
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...glassShadow.soft,
  },
  quantity: {
    fontSize: 16,
    ...typography.headline,
    color: glassColors.text.primary,
    marginHorizontal: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CartItem;
