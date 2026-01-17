import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { typography } from '../theme/typography';

type AdminLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminLogin'>;

interface Props {
    navigation: AdminLoginScreenNavigationProp;
}

const AdminLoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login(email, password, true); // admin flag
            navigation.reset({ index: 0, routes: [{ name: 'AdminPanel' }] });
        } catch (error: any) {
            Alert.alert('Login Failed', error?.response?.data?.message || error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin Access</Text>
                    <Text style={styles.subtitle}>Login to manage the store</Text>
                </View>
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Login</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFC' },
    scrollContent: { flexGrow: 1, padding: 24 },
    header: { marginTop: 60, marginBottom: 40 },
    title: { fontSize: 32, ...typography.title, color: '#1A1A2E', marginBottom: 8 },
    subtitle: { fontSize: 16, ...typography.body, color: '#6B7280' },
    form: { flex: 1 },
    inputContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: 56, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    input: { fontSize: 16, ...typography.body, color: '#1A1A2E' },
    button: { backgroundColor: '#1A1A2E', borderRadius: 12, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 24, shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    buttonText: { fontSize: 16, ...typography.button, color: '#FFFFFF' },
});

export default AdminLoginScreen;
