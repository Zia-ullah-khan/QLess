import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import GlassSlider from '../components/GlassSlider';
import { typography } from '../theme/typography';
import {
  liquidGlassColors,
  liquidShadow,
  squircle,
  liquidBlur,
  getVibrantText,
  glassColors,
  glassShadow,
  radius,
} from '../theme/glass';
import LiquidGlassContainer from '../components/LiquidGlassContainer';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
};

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

interface Props {
  navigation: CartScreenNavigationProp;
}

const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { cartItems, removeFromCart, updateQuantity, getTotal, selectedStore } = useCart();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Header entrance
    Animated.spring(headerAnim, {
      toValue: 1,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Bottom summary entrance
    if (cartItems.length > 0) {
      Animated.spring(bottomAnim, {
        toValue: 0,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }

    // Empty state animation
    if (cartItems.length === 0) {
      Animated.spring(emptyAnim, {
        toValue: 1,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [cartItems.length]);

  const total = getTotal();
  const tax = total * 0.08;
  const grandTotal = total + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#F8FAFF', '#EEF2FF', '#F5F3FF', '#EEF2FF']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <View style={[styles.decorativeOrb, styles.orb1]} />
      <View style={[styles.decorativeOrb, styles.orb2]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Glass Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {Platform.OS !== 'web' && (
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={glassColors.text.primary} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Your Cart</Text>
              <Text style={styles.headerSubtitle}>
                {itemCount === 0 ? 'Empty' : `${itemCount} item${itemCount === 1 ? '' : 's'}`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.scanMoreButton}
              onPress={() => navigation.navigate('Scanner')}
            >
              <LinearGradient
                colors={[liquidGlassColors.accent.primary, liquidGlassColors.accent.secondary]}
                style={styles.scanMoreGradient}
              >
                <Ionicons name="scan" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Store indicator */}
            {selectedStore && (
              <View style={styles.storeIndicator}>
                <Ionicons name="storefront" size={14} color={glassColors.accent.primary} />
                <Text style={styles.storeIndicatorText}>Shopping at {selectedStore.name}</Text>
              </View>
            )}

            {cartItems.map((item, index) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => removeFromCart(item.id)}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                index={index}
              />
            ))}

            {/* Spacer for bottom summary */}
            <View style={{ height: 220 }} />
          </ScrollView>
        ) : (
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: emptyAnim,
                transform: [{ scale: emptyAnim }],
              },
            ]}
          >
            <View style={styles.emptyCard}>
              {Platform.OS !== 'web' && (
                <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
              )}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.6)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.emptyContent}>
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.1)']}
                    style={styles.emptyIconGradient}
                  >
                    <Ionicons name="bag-outline" size={56} color={glassColors.accent.primary} />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptyDescription}>
                  Start scanning products to add them to your cart
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('Scanner')}
                >
                  <LinearGradient
                    colors={[glassColors.accent.primary, glassColors.accent.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyButtonGradient}
                  >
                    <Ionicons name="scan" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyButtonText}>Start Scanning</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Bottom Summary */}
        {cartItems.length > 0 && (
          <Animated.View
            style={[
              styles.bottomContainer,
              { transform: [{ translateY: bottomAnim }] },
            ]}
          >
            {Platform.OS !== 'web' && (
              <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
            )}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (8%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <GlassSlider
                title="Slide to Checkout"
                icon="card-outline"
                onComplete={() => navigation.navigate('Payment')}
                gradient={[glassColors.accent.primary, glassColors.accent.secondary]}
              />
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  decorativeOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    top: -50,
    right: -80,
  },
  orb2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    bottom: 200,
    left: -60,
  },
  header: {
    zIndex: 10,
    overflow: 'hidden',
  },
  headerWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glassColors.border.medium,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 22,
    ...typography.title,
    color: glassColors.text.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    ...typography.caption,
    color: glassColors.text.secondary,
    marginTop: 2,
  },
  scanMoreButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    ...glassShadow.glow,
  },
  scanMoreGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  storeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  storeIndicatorText: {
    fontSize: 13,
    ...typography.caption,
    color: glassColors.accent.primary,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 24,
  },
  emptyIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    ...typography.title,
    color: glassColors.text.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  emptyButton: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...glassShadow.glow,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...typography.button,
    marginLeft: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    borderBottomWidth: 0,
    ...glassShadow.medium,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
  },
  summaryContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
  },
  summaryValue: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: glassColors.border.medium,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    ...typography.title,
    color: glassColors.text.primary,
  },
  totalValue: {
    fontSize: 24,
    ...typography.title,
    color: glassColors.accent.primary,
  },
  sliderContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
});

export default CartScreen;
