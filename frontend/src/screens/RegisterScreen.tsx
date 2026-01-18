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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme/typography';
import { glassColors, glassShadow, radius } from '../theme/glass';
import { registerUser } from '../services/api';
import { RootStackParamList } from '../../App';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'StoreSelect' }],
      });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    icon: keyof typeof Ionicons.glyphMap,
    placeholder: string,
    value: string,
    onChange: (text: string) => void,
    fieldName: string,
    options?: { secureTextEntry?: boolean; keyboardType?: 'email-address' | 'default' }
  ) => (
    <View style={[
      styles.inputContainer,
      focusedField === fieldName && styles.inputContainerFocused
    ]}>
      <View style={styles.inputIcon}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={focusedField === fieldName ? glassColors.accent.primary : glassColors.text.tertiary} 
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        secureTextEntry={options?.secureTextEntry}
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.keyboardType === 'email-address' ? 'none' : 'words'}
        placeholderTextColor={glassColors.text.tertiary}
        onFocus={() => setFocusedField(fieldName)}
        onBlur={() => setFocusedField(null)}
      />
    </View>
  );

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
                colors={[glassColors.accent.secondary, glassColors.accent.tertiary]}
                style={styles.logoGradient}
              >
                <Ionicons name="person-add" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join QLess for faster shopping</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: formAnim,
                transform: [{ scale: formAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
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
            <View style={styles.formContent}>
              {renderInput('person-outline', 'Full name', name, setName, 'name')}
              {renderInput('mail-outline', 'Email address', email, setEmail, 'email', { keyboardType: 'email-address' })}
              {renderInput('lock-closed-outline', 'Password', password, setPassword, 'password', { secureTextEntry: true })}
              {renderInput('shield-checkmark-outline', 'Confirm password', confirmPassword, setConfirmPassword, 'confirm', { secureTextEntry: true })}
            </View>
          </Animated.View>

          {/* Register Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ translateY: buttonAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={loading 
                  ? ['rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)']
                  : [glassColors.accent.secondary, glassColors.accent.tertiary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.registerButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Sign In Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
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
    width: 280,
    height: 280,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    top: -80,
    right: -100,
  },
  orb2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    bottom: 150,
    left: -50,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 28,
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
    fontSize: 30,
    ...typography.title,
    color: glassColors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    ...typography.body,
    color: glassColors.text.secondary,
  },
  formCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassColors.border.light,
    marginBottom: 24,
    ...glassShadow.soft,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
  },
  formContent: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: radius.lg,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: glassColors.border.medium,
  },
  inputContainerFocused: {
    borderColor: glassColors.accent.secondary,
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
  buttonContainer: {
    marginTop: 8,
  },
  registerButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: glassColors.accent.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  registerButtonText: {
    fontSize: 17,
    ...typography.button,
    color: '#FFFFFF',
    marginRight: 8,
  },
  terms: {
    fontSize: 13,
    ...typography.body,
    color: glassColors.text.tertiary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  termsLink: {
    color: glassColors.accent.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    ...typography.body,
    color: glassColors.text.secondary,
  },
  linkText: {
    fontSize: 15,
    ...typography.button,
    color: glassColors.accent.secondary,
  },
});

export default RegisterScreen;
