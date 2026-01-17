import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


type AuthContextType = {
    token: string | null;
    isAdmin: boolean;
    login: (email: string, password: string, admin?: boolean) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    token: null,
    isAdmin: false,
    login: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Load token from storage on mount
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('authToken');
                const storedAdmin = await AsyncStorage.getItem('isAdmin');
                if (storedToken) setToken(storedToken);
                if (storedAdmin === 'true') setIsAdmin(true);
            } catch (e) {
                console.error('Failed to load auth token', e);
            }
        };
        loadToken();
    }, []);

    const login = async (email: string, password: string, admin = false) => {
        try {
            const API_BASE_URL = 'http://10.113.203.223:5000';
            const endpoint = admin ? `${API_BASE_URL}/api/admin/login` : `${API_BASE_URL}/api/auth/login`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            const { token: receivedToken, isAdmin: adminFlag } = data;
            await AsyncStorage.setItem('authToken', receivedToken);
            await AsyncStorage.setItem('isAdmin', adminFlag ? 'true' : 'false');
            setToken(receivedToken);
            setIsAdmin(!!adminFlag);
        } catch (error: any) {
            Alert.alert('Login Failed', error?.message || 'An error occurred');
            throw error;
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('isAdmin');
        setToken(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
