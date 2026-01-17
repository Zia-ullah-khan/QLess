import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../context/CartContext';
import { typography } from '../theme/typography';

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
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
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
    ]).start(() => {
      onRemove();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={styles.itemInfo}>
        <View style={styles.iconContainer}>
          {item.image && productImages[item.image] ? (
            <Image 
              source={productImages[item.image]} 
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="cube-outline" size={24} color="#4A90A4" />
          )}
        </View>
        <View style={styles.details}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.quantity - 1)}
        >
          <Ionicons name="remove" size={18} color="#4A90A4" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.quantity + 1)}
        >
          <Ionicons name="add" size={18} color="#4A90A4" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  details: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    ...typography.headline,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    ...typography.body,
    color: '#4A90A4',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 15,
    ...typography.headline,
    color: '#1A1A2E',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
});

export default CartItem;
