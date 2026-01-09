import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { Button } from '@components/common';
import { AuthStackParamList } from '@navigation/types';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoText}>📦</Text>
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            {t('welcome.appName')}
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            {t('welcome.tagline')}
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem
            icon="📱"
            title={t('welcome.feature1Title')}
            description={t('welcome.feature1Desc')}
          />
          <FeatureItem
            icon="🔄"
            title={t('welcome.feature2Title')}
            description={t('welcome.feature2Desc')}
          />
          <FeatureItem
            icon="📊"
            title={t('welcome.feature3Title')}
            description={t('welcome.feature3Desc')}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('auth.login')}
          onPress={() => navigation.navigate('Login')}
          fullWidth
          size="large"
        />
        <Button
          title={t('auth.register')}
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          fullWidth
          size="large"
          style={styles.registerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { fontSize: 48 },
  appName: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  tagline: { fontSize: 16 },
  features: { marginTop: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  featureIcon: { fontSize: 32, marginRight: 16 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  featureDescription: { fontSize: 14 },
  buttonContainer: { paddingHorizontal: 24, paddingBottom: 24 },
  registerButton: { marginTop: 12 },
});