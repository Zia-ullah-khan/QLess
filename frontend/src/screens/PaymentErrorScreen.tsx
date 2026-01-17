import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme/typography';

// We'll define the param list in App.tsx later, but locally here for types
type RootStackParamList = {
    Payment: undefined;
    PaymentError: { message: string };
};

type PaymentErrorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentError'>;
type PaymentErrorScreenRouteProp = RouteProp<RootStackParamList, 'PaymentError'>;

interface Props {
    navigation: PaymentErrorScreenNavigationProp;
    route: PaymentErrorScreenRouteProp;
}

const PaymentErrorScreen: React.FC<Props> = ({ navigation, route }) => {
    const { message } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="alert-circle" size={64} color="#EF4444" />
                </View>

                <Text style={styles.title}>Payment Failed</Text>
                <Text style={styles.message}>
                    {message || 'Something went wrong with your transaction. Please try again.'}
                </Text>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.navigate('Payment')} // Or specific fallback
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF2F2', // Light red background
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        ...typography.title,
        color: '#7F1D1D',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        ...typography.body,
        color: '#991B1B',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    retryButton: {
        width: '100%',
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        ...typography.button,
        marginRight: 8,
    },
    cancelButton: {
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: '#EF4444',
        fontSize: 16,
        ...typography.button,
    },
});

export default PaymentErrorScreen;
