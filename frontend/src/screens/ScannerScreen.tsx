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
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { scanBarcode } from '../services/api';
import AnimatedCheckmark from '../components/AnimatedCheckmark';
import { typography } from '../theme/typography';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  QRCode: undefined;
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
  const { selectedStore, cartItems, addToCart } = useCart();

  // Only run camera when screen is focused
  const isFocused = useIsFocused();

  // Use ref to prevent race condition with double scanning
  const isScanningRef = useRef(false);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const itemCardAnim = useRef(new Animated.Value(100)).current;
  const itemCardOpacity = useRef(new Animated.Value(0)).current;
  const overlayPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate scan line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for overlay
    Animated.loop(
      Animated.sequence([
        Animated.timing(overlayPulse, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(overlayPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Prevent double-scan - check ref FIRST (state updates are async)
    if (isScanningRef.current) {
      console.log('⏭️ Ignoring duplicate scan');
      return;
    }

    console.log('🔍 Barcode detected:', type, data);

    // Set ref immediately to block any subsequent scans
    isScanningRef.current = true;
    setScanned(true);

    console.log('✅ Processing barcode:', data);

    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      if (!selectedStore) {
        throw new Error('No store selected');
      }

      // Call backend API
      const item = await scanBarcode(selectedStore.id, data);

      // Add to cart
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        barcode: item.barcode,
        image: item.image,
      });

      setLastScannedItem(item.name);
      setShowSuccess(true);

      // Animate item card
      Animated.parallel([
        Animated.spring(itemCardAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(itemCardOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset after delay
      setTimeout(() => {
        setShowSuccess(false);
        Animated.parallel([
          Animated.timing(itemCardAnim, {
            toValue: 100,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(itemCardOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setScanned(false);
          isScanningRef.current = false;
          setLastScannedItem(null);
        });
      }, 1500);
    } catch (error) {
      console.error('Scan error:', error);

      // Show error message for unknown barcodes
      setErrorMessage('Product not found');
      setShowError(true);

      // Haptic feedback for error
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Reset after delay
      setTimeout(() => {
        setShowError(false);
        setErrorMessage(null);
        setScanned(false);
        isScanningRef.current = false;
      }, 1500);
    }
  };

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={64} color="#4A90A4" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            QLess needs camera access to scan product barcodes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Only render camera when screen is focused to save resources */}
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

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <View style={styles.storeInfo}>
          <Ionicons name="location" size={16} color="#FFFFFF" />
          <Text style={styles.storeName}>{selectedStore?.name || 'Store'}</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Scan Area */}
      <View style={styles.scanAreaContainer}>
        <Animated.View
          style={[
            styles.scanArea,
            { transform: [{ scale: overlayPulse }] },
          ]}
        >
          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Scan line */}
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineTranslate }] },
            ]}
          />
        </Animated.View>

        <Text style={styles.scanHint}>Position barcode within frame</Text>
      </View>

      {/* Success Overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <AnimatedCheckmark size={60} />
          <Text style={styles.successText}>Added to Cart!</Text>
        </View>
      )}

      {/* Error Overlay */}
      {showError && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorIcon}>
            <Ionicons name="close" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Text style={styles.errorHint}>Try scanning a valid product barcode</Text>
        </View>
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
        <View style={styles.itemCardIcon}>
          <Ionicons name="cube" size={24} color="#4A90A4" />
        </View>
        <Text style={styles.itemCardText} numberOfLines={1}>
          {lastScannedItem}
        </Text>
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      </Animated.View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <Ionicons name="bag-check-outline" size={22} color="#FFFFFF" />
          <Text style={styles.checkoutButtonText}>
            Checkout {cartCount > 0 ? `(${cartCount})` : ''}
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  storeName: {
    color: '#FFFFFF',
    fontSize: 14,
    ...typography.headline,
    marginLeft: 6,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    ...typography.title,
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
    width: 40,
    height: 40,
    borderColor: '#4A90A4',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 14,
    ...typography.body,
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 20,
    ...typography.title,
    marginTop: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 20,
    ...typography.title,
    marginTop: 16,
  },
  errorHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    ...typography.body,
    marginTop: 8,
  },
  itemCard: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  itemCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemCardText: {
    flex: 1,
    fontSize: 16,
    ...typography.headline,
    color: '#1A1A2E',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    ...typography.button,
    marginLeft: 8,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  permissionTitle: {
    fontSize: 22,
    ...typography.title,
    color: '#1A1A2E',
    marginTop: 20,
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 15,
    ...typography.body,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#4A90A4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...typography.button,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...typography.body,
  },
});

export default ScannerScreen;
