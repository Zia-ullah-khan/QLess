import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    FlatList,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { AuthContext } from '../context/AuthContext';
import { typography } from '../theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.113.203.223:5000/api';

type AdminPanelScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminPanel'>;

interface Props {
    navigation: AdminPanelScreenNavigationProp;
}

interface Store {
    _id: string;
    name: string;
    logo_url?: string;
    is_active: boolean;
}

interface Product {
    _id: string;
    name: string;
    price: number;
    sku: string;
    barcode_value?: string;
    image_url?: string;
    is_active: boolean;
}

const AdminPanelScreen: React.FC<Props> = ({ navigation }) => {
    const { logout } = useContext(AuthContext);
    const [stores, setStores] = useState<Store[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState<string | null>(null);

    // Form states
    const [storeName, setStoreName] = useState('');
    const [storeLogoUrl, setStoreLogoUrl] = useState('');
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productSku, setProductSku] = useState('');
    const [productBarcode, setProductBarcode] = useState('');

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    };

    const fetchStores = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/stores`, { headers });
            const data = await response.json();
            setStores(data.stores || []);
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        }
    };

    const fetchProducts = async (storeId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/stores/${storeId}/products`, { headers });
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchStores();
            setLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (selectedStore) {
            fetchProducts(selectedStore);
        }
    }, [selectedStore]);

    const handleAddStore = async () => {
        if (!storeName.trim()) {
            Alert.alert('Error', 'Store name is required');
            return;
        }
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/stores`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: storeName, logo_url: storeLogoUrl }),
            });
            if (response.ok) {
                Alert.alert('Success', 'Store created successfully');
                setStoreName('');
                setStoreLogoUrl('');
                setShowAddModal(false);
                fetchStores();
            } else {
                const err = await response.json();
                Alert.alert('Error', err.message || 'Failed to create store');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleAddProduct = async () => {
        if (!selectedStore || !productName.trim() || !productPrice || !productSku.trim()) {
            Alert.alert('Error', 'All fields are required');
            return;
        }
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    storeId: selectedStore,
                    name: productName,
                    price: parseFloat(productPrice),
                    sku: productSku,
                    barcode_value: productBarcode,
                }),
            });
            if (response.ok) {
                Alert.alert('Success', 'Product created successfully');
                setProductName('');
                setProductPrice('');
                setProductSku('');
                setProductBarcode('');
                setShowAddModal(false);
                fetchProducts(selectedStore);
            } else {
                const err = await response.json();
                Alert.alert('Error', err.message || 'Failed to create product');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    };

    const renderStoreItem = ({ item }: { item: Store }) => (
        <TouchableOpacity
            style={[styles.card, selectedStore === item._id && styles.cardSelected]}
            onPress={() => {
                setSelectedStore(item._id);
                setActiveTab('products');
            }}
        >
            <View style={styles.cardContent}>
                <Ionicons name="storefront-outline" size={24} color="#4A90A4" />
                <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.is_active ? 'Active' : 'Inactive'}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const renderProductItem = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Ionicons name="cube-outline" size={24} color="#10B981" />
                <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>
                        ${item.price.toFixed(2)} | SKU: {item.sku}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90A4" />
                    <Text style={styles.loadingText}>Loading admin panel...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Panel</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stores' && styles.tabActive]}
                    onPress={() => setActiveTab('stores')}
                >
                    <Text style={[styles.tabText, activeTab === 'stores' && styles.tabTextActive]}>
                        Stores
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'products' && styles.tabActive]}
                    onPress={() => setActiveTab('products')}
                >
                    <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
                        Products
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'stores' ? (
                <FlatList
                    data={stores}
                    keyExtractor={(item) => item._id}
                    renderItem={renderStoreItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No stores found</Text>}
                />
            ) : (
                <>
                    {selectedStore ? (
                        <FlatList
                            data={products}
                            keyExtractor={(item) => item._id}
                            renderItem={renderProductItem}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyText}>Select a store first</Text>
                        </View>
                    )}
                </>
            )}

            <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Add {activeTab === 'stores' ? 'Store' : 'Product'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#1A1A2E" />
                            </TouchableOpacity>
                        </View>

                        {activeTab === 'stores' ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Store Name"
                                    value={storeName}
                                    onChangeText={setStoreName}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Logo URL (optional)"
                                    value={storeLogoUrl}
                                    onChangeText={setStoreLogoUrl}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity style={styles.modalButton} onPress={handleAddStore}>
                                    <Text style={styles.modalButtonText}>Create Store</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Product Name"
                                    value={productName}
                                    onChangeText={setProductName}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Price"
                                    value={productPrice}
                                    onChangeText={setProductPrice}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="SKU"
                                    value={productSku}
                                    onChangeText={setProductSku}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Barcode (optional)"
                                    value={productBarcode}
                                    onChangeText={setProductBarcode}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity style={styles.modalButton} onPress={handleAddProduct}>
                                    <Text style={styles.modalButtonText}>Create Product</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280', ...typography.body },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 24, color: '#1A1A2E', ...typography.title },
    logoutButton: { padding: 8 },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 16 },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: '#4A90A4' },
    tabText: { fontSize: 16, color: '#6B7280', ...typography.body },
    tabTextActive: { color: '#4A90A4', fontWeight: '600' },
    list: { padding: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardSelected: { borderWidth: 2, borderColor: '#4A90A4' },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    cardText: { marginLeft: 12 },
    cardTitle: { fontSize: 16, color: '#1A1A2E', ...typography.body, fontWeight: '600' },
    cardSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 16, marginTop: 12 },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4A90A4',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A90A4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: { fontSize: 20, color: '#1A1A2E', ...typography.title },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: '#1A1A2E',
    },
    modalButton: {
        backgroundColor: '#4A90A4',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default AdminPanelScreen;
