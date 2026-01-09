import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { useAuthStore } from '@store/auth-store';
import { Button, Input } from '@components/common';
import { AuthStackParamList } from '@navigation/types';
import { validateRegisterForm } from '@utils/validators';
import api from '@services/api';
import { LoginResponse } from '../../types/api';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const validation = validateRegisterForm(
      email,
      password,
      confirmPassword,
      name
    );
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/api/auth/register', {
        email: email.toLowerCase().trim(),
        password,
        confirmPassword,
        name: name.trim(),
      });

      setAuth(response.data.user, response.data.token, response.data.refreshToken);
      Alert.alert(t('common.success'), t('auth.registerSuccess'));
    }  catch (error: any) {
  console.log('Register Error:', JSON.stringify(error, null, 2));

  if (error.errors) {
    const errorMessages = Object.entries(error.errors)
      .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
      .join('\n');
    Alert.alert(t('common.error'), errorMessages);
  } else {
    Alert.alert(t('common.error'), error.message || t('auth.registerError'));
  }
}
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('auth.register')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Yeni hesap oluşturun
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.name')}
              placeholder="Adınız Soyadınız"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
              icon="person-outline"
            />

            <Input
              label={t('auth.email')}
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon="mail-outline"
            />

            <Input
              label={t('auth.password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              icon="lock-closed-outline"
            />

            <Input
              label={t('auth.confirmPassword')}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              icon="lock-closed-outline"
            />

            <Button
              title={t('auth.register')}
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="large"
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t('auth.alreadyHaveAccount')}
            </Text>
            <Button
              title={t('auth.login')}
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
  },
});