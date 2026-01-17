import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import StoreCard from '../components/StoreCard';
import { useCart } from '../context/CartContext';
import { typography } from '../theme/typography';

type RootStackParamList = {
  Landing: undefined;
  StoreSelect: undefined;
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
  QRCode: undefined;
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

//pull stores from 'localhost:5000/api/getstores' now
const fetchStores = async (): Promise<Store[]> => {
  try {
    const response = await fetch('http://10.113.203.223:5000/api/getstores');
    const data: Store[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
};
// Stores data fetching moved inside component state

const StoreSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { setSelectedStore, clearCart } = useCart();
  const [stores, setStores] = React.useState<Store[]>([]);

  React.useEffect(() => {
    fetchStores().then(setStores);
  }, []);

  const handleStoreSelect = (store: Store) => {
    clearCart(); // Clear any previous cart
    setSelectedStore(store);
    navigation.navigate('Scanner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={20} color="#4A90A4" />
          </View>
          <View>
            <Text style={styles.headerSubtitle}>Select your</Text>
            <Text style={styles.headerTitle}>Store</Text>
          </View>
        </View>
      </View>

      {/* Store Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Nearby Stores</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    ...typography.body,
  },
  headerTitle: {
    fontSize: 24,
    ...typography.title,
    color: '#1A1A2E',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    ...typography.headline,
    color: '#6B7280',
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

export default StoreSelectScreen;
