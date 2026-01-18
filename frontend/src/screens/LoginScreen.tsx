import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius, squircle } from '../theme/glass';
import LiquidGlassContainer from '../components/LiquidGlassContainer';
import { loginUser } from '../services/api';
import { RootStackParamList } from '../../App';

const { width } = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Animations
    const headerAnim = useRef(new Animated.Value(0)).current;
    const formAnim = useRef(new Animated.Value(0)).current;
    const buttonAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.stagger(100, [
            Animated.spring(headerAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
            Animated.spring(formAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
            Animated.spring(buttonAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await loginUser(email, password);
            navigation.reset({
                index: 0,
                routes: [{ name: 'StoreSelect' }],
            });
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Gradient Background */}
            <LinearGradient
                colors={['#F8FAFF', '#EEF2FF', '#E0E7FF', '#EEF2FF']}
                locations={[0, 0.3, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative orbs */}
            <View style={[styles.decorativeOrb, styles.orb1]} />
            <View style={[styles.decorativeOrb, styles.orb2]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <Animated.View
                        style={[
                            styles.header,
                            {
                                opacity: headerAnim,
                                transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={24} color={glassColors.text.primary} />
                        </TouchableOpacity>

                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={[glassColors.accent.primary, glassColors.accent.secondary]}
                                style={styles.logoGradient}
                            >
                                <Ionicons name="flash" size={32} color="#FFFFFF" />
                            </LinearGradient>
                        </View>

                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue shopping</Text>
                    </Animated.View>

                    {/* Form Card - Liquid Glass */}
                    <Animated.View
                        style={[
                            styles.formCardWrapper,
                            {
                                opacity: formAnim,
                                transform: [{ scale: formAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
                            },
                        ]}
                    >
                            <LiquidGlassContainer
                            variant="elevated"
                            glassOpacity={0.85}
                            enableLiquidDisplacement={false}
                            animated={false}
                            padding={24}
                            borderRadius={squircle.xxl}
                        >
                            {/* Email Input */}
                            <View style={[
                                styles.inputContainer,
                                focusedField === 'email' && styles.inputContainerFocused
                            ]}>
                                <View style={styles.inputIcon}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color={focusedField === 'email' ? glassColors.accent.primary : glassColors.text.tertiary}
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email address"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={glassColors.text.tertiary}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>

                            {/* Password Input */}
                            <View style={[
                                styles.inputContainer,
                                focusedField === 'password' && styles.inputContainerFocused
                            ]}>
                                <View style={styles.inputIcon}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color={focusedField === 'password' ? glassColors.accent.primary : glassColors.text.tertiary}
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    placeholderTextColor={glassColors.text.tertiary}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </LiquidGlassContainer>
                    </Animated.View>

                    {/* Login Button */}
                    <Animated.View
                        style={[
                            styles.buttonContainer,
                            { transform: [{ translateY: buttonAnim }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={loading
                                    ? ['rgba(99, 102, 241, 0.7)', 'rgba(139, 92, 246, 0.7)']
                                    : [glassColors.accent.primary, glassColors.accent.secondary]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.loginButtonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={styles.loginButtonText}>Sign In</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login Buttons */}
                        <View style={styles.socialButtons}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color={glassColors.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={22} color={glassColors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.linkText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    decorativeOrb: {
        position: 'absolute',
        borderRadius: 999,
    },
    orb1: {
        width: 300,
        height: 300,
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        top: -100,
        right: -80,
    },
    orb2: {
        width: 200,
        height: 200,
        backgroundColor: 'rgba(236, 72, 153, 0.08)',
        bottom: 100,
        left: -60,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 32,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: glassColors.border.medium,
        ...glassShadow.soft,
    },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 24,
        ...glassShadow.glow,
    },
    logoGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        ...typography.title,
        color: glassColors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        ...typography.body,
        color: glassColors.text.secondary,
    },
    // LiquidGlassContainer replaces formCard
    formContent: {
        // No longer needed - padding handled by LiquidGlassContainer
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: radius.lg,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 58,
        borderWidth: 1.5,
        borderColor: glassColors.border.medium,
    },
    inputContainerFocused: {
        borderColor: glassColors.accent.primary,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        ...typography.body,
        color: glassColors.text.primary,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    forgotPasswordText: {
        fontSize: 14,
        ...typography.body,
        color: glassColors.accent.primary,
    },
    buttonContainer: {
        marginTop: 8,
    },
    loginButton: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        ...glassShadow.glow,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    loginButtonText: {
        fontSize: 17,
        ...typography.button,
        color: '#FFFFFF',
        marginRight: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: glassColors.border.medium,
    },
    dividerText: {
        fontSize: 14,
        ...typography.body,
        color: glassColors.text.tertiary,
        marginHorizontal: 16,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 28,
    },
    socialButton: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: glassColors.border.medium,
        ...glassShadow.soft,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 15,
        ...typography.body,
        color: glassColors.text.secondary,
    },
    linkText: {
        fontSize: 15,
        ...typography.button,
        color: glassColors.accent.primary,
    },
});

export default LoginScreen;
