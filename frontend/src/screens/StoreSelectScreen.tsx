import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import StoreCard from '../components/StoreCard';
import { useCart } from '../context/CartContext';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius, squircle } from '../theme/glass';
import LiquidGlassContainer from '../components/LiquidGlassContainer';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  LiquidTest: undefined;
};

type StoreSelectScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StoreSelect'
>;

interface Props {
  navigation: StoreSelectScreenNavigationProp;
}

type Store = {
  id: string;
  name: string;
  logo: string;
};

const fetchStores = async (): Promise<Store[]> => {
  try {
    const response = await fetch('http://10.113.203.223:5000/api/stores');
    const data = await response.json();
    return data.map((store: any) => ({
      id: store._id || store.id,
      name: store.name,
      logo: store.logo_url || store.logo || store.image_url || '',
    }));
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
};

const StoreSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { setSelectedStore, clearCart, selectedStore, cartItems } = useCart();
  const [stores, setStores] = React.useState<Store[]>([]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const resumeAnim = useRef(new Animated.Value(0)).current;
  const resumeSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchStores().then(setStores);

    // Header entrance animation
    Animated.spring(headerAnim, {
      toValue: 1,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Resume card animation if applicable
    if (selectedStore && cartItems.length > 0) {
      Animated.parallel([
        Animated.spring(resumeAnim, {
          toValue: 1,
          friction: 8,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.spring(resumeSlide, {
          toValue: 0,
          friction: 8,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  const handleStoreSelect = (store: Store) => {
    clearCart();
    setSelectedStore(store);
    navigation.navigate('Scanner');
  };

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
        {/* Liquid Glass Header */}
        <Animated.View
          style={[
            styles.headerWrapper,
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
          <LiquidGlassContainer
            variant="elevated"
            glassOpacity={0.85}
            enableLiquidDisplacement={false}
            animated={false}
            padding={0}
            borderRadius={squircle.xxl}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.locationIcon}>
                  <LinearGradient
                    colors={[glassColors.accent.primary, glassColors.accent.secondary]}
                    style={styles.locationGradient}
                  >
                    <Ionicons name="location" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View>
                  <Text style={styles.headerSubtitle}>Select your</Text>
                  <Text style={styles.headerTitle}>Store</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={22} color={glassColors.text.secondary} />
              </TouchableOpacity>
            </View>
          </LiquidGlassContainer>
        </Animated.View>

        {/* Store Grid */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Resume Cart Banner */}
          {selectedStore && cartItems.length > 0 && (
            <Animated.View
              style={[
                styles.resumeContainer,
                {
                  opacity: resumeAnim,
                  transform: [{ translateY: resumeSlide }],
                },
              ]}
            >
              <View style={styles.resumeCard}>
                {Platform.OS !== 'web' && (
                  <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
                )}
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.12)', 'rgba(139, 92, 246, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.resumeContent}>
                  <View style={styles.resumeInfo}>
                    <View style={styles.resumeBadge}>
                      <Ionicons name="cart" size={14} color={glassColors.accent.primary} />
                      <Text style={styles.resumeBadgeText}>Active Cart</Text>
                    </View>
                    <Text style={styles.resumeStore}>{selectedStore.name}</Text>
                    <Text style={styles.resumeItems}>
                      {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} waiting
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={() => navigation.navigate('Scanner')}
                  >
                    <LinearGradient
                      colors={[glassColors.accent.primary, glassColors.accent.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.resumeButtonGradient}
                    >
                      <Text style={styles.resumeButtonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          {/* TEMP BUTTON */}
          <TouchableOpacity
            style={{
              marginHorizontal: 16,
              marginBottom: 16,
              padding: 12,
              backgroundColor: '#333',
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => navigation.navigate('LiquidTest')}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Test Liquid Glass (Dev)</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Stores</Text>
            <View style={styles.sectionBadge}>
              <Ionicons name="location-outline" size={14} color={glassColors.accent.primary} />
              <Text style={styles.sectionBadgeText}>{stores.length} available</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {stores.map((store: Store, index: number) => (
              <StoreCard
                key={store.id}
                id={store.id}
                name={store.name}
                logo={store.logo}
                onPress={() => handleStoreSelect(store)}
                index={index}
              />
            ))}
          </View>

          {/* Empty state handling */}
          {stores.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="storefront-outline" size={48} color={glassColors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>Loading stores...</Text>
              <Text style={styles.emptySubtitle}>Finding stores near you</Text>
            </View>
          )}
        </ScrollView>
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
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    top: -100,
    right: -100,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(236, 72, 153, 0.06)',
    bottom: 100,
    left: -50,
  },
  headerWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
  },
  locationGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: glassColors.text.secondary,
    ...typography.body,
  },
  headerTitle: {
    fontSize: 26,
    ...typography.title,
    color: glassColors.text.primary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glassColors.border.medium,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 32,
  },
  resumeContainer: {
    marginHorizontal: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  resumeCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
  },
  resumeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  resumeBadgeText: {
    fontSize: 11,
    ...typography.caption,
    color: glassColors.accent.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  resumeStore: {
    fontSize: 18,
    ...typography.headline,
    color: glassColors.text.primary,
    marginBottom: 4,
  },
  resumeItems: {
    fontSize: 14,
    ...typography.body,
    color: glassColors.text.secondary,
  },
  resumeButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  resumeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...typography.button,
    marginRight: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    ...typography.headline,
    color: glassColors.text.primary,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 12,
    ...typography.caption,
    color: glassColors.accent.primary,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    ...typography.headline,
    color: glassColors.text.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    ...typography.body,
    color: glassColors.text.tertiary,
  },
});

export default StoreSelectScreen;
