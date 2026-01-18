import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { scanBarcode } from '../services/api';
import AnimatedCheckmark from '../components/AnimatedCheckmark';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius } from '../theme/glass';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.72;

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
};

type ScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Scanner'>;

interface Props {
  navigation: ScannerScreenNavigationProp;
}

const ScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);
  const [lastScannedPrice, setLastScannedPrice] = useState<number | null>(null);
  const { selectedStore, cartItems, addToCart } = useCart();

  const isFocused = useIsFocused();
  const isScanningRef = useRef(false);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const itemCardAnim = useRef(new Animated.Value(100)).current;
  const itemCardOpacity = useRef(new Animated.Value(0)).current;
  const cornerPulse = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate scan line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for corners
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(cornerPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (isScanningRef.current) return;

    isScanningRef.current = true;
    setScanned(true);

    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      if (!selectedStore) {
        throw new Error('No store selected');
      }

      const item = await scanBarcode(selectedStore.id, data);

      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        barcode: item.barcode,
        image: item.image,
      });

      setLastScannedItem(item.name);
      setLastScannedPrice(item.price);
      setShowSuccess(true);

      // Success animation
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      // Animate item card
      Animated.parallel([
        Animated.spring(itemCardAnim, {
          toValue: 0,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(itemCardOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset after delay
      setTimeout(() => {
        setShowSuccess(false);
        successScale.setValue(0);
        Animated.parallel([
          Animated.timing(itemCardAnim, {
            toValue: 100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(itemCardOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setScanned(false);
          isScanningRef.current = false;
          setLastScannedItem(null);
          setLastScannedPrice(null);
        });
      }, 1800);
    } catch (error) {
      console.error('Scan error:', error);

      setErrorMessage('Product not found');
      setShowError(true);

      // Shake animation
      Animated.sequence([
        Animated.timing(errorShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setTimeout(() => {
        setShowError(false);
        setErrorMessage(null);
        setScanned(false);
        isScanningRef.current = false;
      }, 1800);
    }
  };

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 6],
  });

  if (!permission) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A1A2E', '#2D2D44']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={['#F8FAFF', '#EEF2FF', '#E0E7FF']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.permissionCard}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.permissionContent}>
            <View style={styles.permissionIconContainer}>
              <LinearGradient
                colors={[glassColors.accent.primary, glassColors.accent.secondary]}
                style={styles.permissionIconGradient}
              >
                <Ionicons name="camera" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.permissionTitle}>Camera Access</Text>
            <Text style={styles.permissionDescription}>
              QLess needs camera access to scan product barcodes and make your shopping faster.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <LinearGradient
                colors={[glassColors.accent.primary, glassColors.accent.secondary]}
                style={styles.permissionButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.permissionButtonText}>Grant Access</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {isFocused && (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      )}

      {/* Dark vignette overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent', 'transparent', 'rgba(0,0,0,0.5)']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Header Overlay with Glass effect */}
      <View style={styles.headerOverlay}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.storeInfo}>
            <View style={styles.storeDot} />
            <Text style={styles.storeName}>{selectedStore?.name || 'Store'}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-outline" size={22} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scan Area */}
      <View style={styles.scanAreaContainer}>
        <Animated.View
          style={[
            styles.scanArea,
            { transform: [{ scale: cornerPulse }] },
          ]}
        >
          {/* Corner brackets with gradient */}
          <View style={[styles.corner, styles.topLeft]}>
            <LinearGradient
              colors={[glassColors.accent.primary, glassColors.accent.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cornerGradient}
            />
          </View>
          <View style={[styles.corner, styles.topRight]}>
            <LinearGradient
              colors={[glassColors.accent.cyan, glassColors.accent.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cornerGradient}
            />
          </View>
          <View style={[styles.corner, styles.bottomLeft]}>
            <LinearGradient
              colors={[glassColors.accent.primary, glassColors.accent.secondary]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.cornerGradient}
            />
          </View>
          <View style={[styles.corner, styles.bottomRight]}>
            <LinearGradient
              colors={[glassColors.accent.secondary, glassColors.accent.tertiary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cornerGradient}
            />
          </View>

          {/* Scan line with glow */}
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineTranslate }] },
            ]}
          >
            <LinearGradient
              colors={['transparent', glassColors.accent.emerald, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanLineGradient}
            />
          </Animated.View>
        </Animated.View>

        <View style={styles.scanHintContainer}>
          <Text style={styles.scanHint}>Position barcode within frame</Text>
        </View>
      </View>

      {/* Success Overlay */}
      {showSuccess && (
        <View style={styles.feedbackOverlay}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <Animated.View style={{ transform: [{ scale: successScale }] }}>
            <View style={styles.successCircle}>
              <LinearGradient
                colors={[glassColors.accent.emerald, '#059669']}
                style={StyleSheet.absoluteFill}
              />
              <AnimatedCheckmark size={50} color="transparent" />
              <Ionicons name="checkmark" size={50} color="#FFFFFF" style={{ position: 'absolute' }} />
            </View>
          </Animated.View>
          <Text style={styles.feedbackTitle}>Added to Cart!</Text>
        </View>
      )}

      {/* Error Overlay */}
      {showError && (
        <Animated.View style={[styles.feedbackOverlay, { transform: [{ translateX: errorShake }] }]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.errorCircle}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="close" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.feedbackTitle}>{errorMessage}</Text>
          <Text style={styles.feedbackSubtitle}>Try scanning a valid product</Text>
        </Animated.View>
      )}

      {/* Item Card */}
      <Animated.View
        style={[
          styles.itemCard,
          {
            transform: [{ translateY: itemCardAnim }],
            opacity: itemCardOpacity,
          },
        ]}
      >
        {Platform.OS !== 'web' && (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.itemCardContent}>
          <View style={styles.itemCardIcon}>
            <LinearGradient
              colors={[glassColors.accent.emerald, '#059669']}
              style={styles.itemCardIconGradient}
            >
              <Ionicons name="cube" size={22} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.itemCardInfo}>
            <Text style={styles.itemCardText} numberOfLines={1}>
              {lastScannedItem}
            </Text>
            {lastScannedPrice && (
              <Text style={styles.itemCardPrice}>${lastScannedPrice.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.itemCardCheck}>
            <Ionicons name="checkmark-circle" size={26} color={glassColors.accent.emerald} />
          </View>
        </View>
      </Animated.View>

      {/* Bottom Actions with Glass */}
      <View style={styles.bottomActions}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[glassColors.accent.primary, glassColors.accent.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checkoutButtonGradient}
          >
            <Ionicons name="bag-check" size={22} color="#FFFFFF" />
            <Text style={styles.checkoutButtonText}>
              View Cart {cartCount > 0 ? `(${cartCount})` : ''}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  storeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: glassColors.accent.emerald,
    marginRight: 8,
  },
  storeName: {
    color: '#FFFFFF',
    fontSize: 15,
    ...typography.headline,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: glassColors.accent.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    ...typography.headline,
  },
  scanAreaContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    overflow: 'hidden',
  },
  cornerGradient: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
    borderColor: 'transparent',
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
    borderColor: 'transparent',
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
    borderColor: 'transparent',
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
    borderColor: 'transparent',
  },
  scanLine: {
    width: '100%',
    height: 4,
    overflow: 'visible',
  },
  scanLineGradient: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    shadowColor: glassColors.accent.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  scanHintContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  scanHint: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    ...typography.body,
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...glassShadow.glow,
  },
  errorCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  feedbackTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    ...typography.title,
    marginTop: 20,
  },
  feedbackSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    ...typography.body,
    marginTop: 8,
  },
  itemCard: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    ...glassShadow.medium,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
  },
  itemCardIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCardInfo: {
    flex: 1,
  },
  itemCardText: {
    fontSize: 16,
    ...typography.headline,
    color: glassColors.text.primary,
  },
  itemCardPrice: {
    fontSize: 14,
    ...typography.body,
    color: glassColors.accent.emerald,
    marginTop: 2,
  },
  itemCardCheck: {
    marginLeft: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  checkoutButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...glassShadow.glow,
  },
  checkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    ...typography.button,
    marginLeft: 10,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    ...glassShadow.medium,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
  },
  permissionContent: {
    padding: 32,
    alignItems: 'center',
  },
  permissionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...glassShadow.glow,
  },
  permissionIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    fontSize: 24,
    ...typography.title,
    color: glassColors.text.primary,
    marginBottom: 12,
  },
  permissionDescription: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...glassShadow.glow,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...typography.button,
    marginLeft: 8,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...typography.body,
  },
});

export default ScannerScreen;
