import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { useAuthStore } from '@store/auth-store';
import { useSettingsStore } from '@store/settings-store';
import { Card, RadioButton } from '@components/common';
import { SettingsStackParamList } from '@navigation/types';
import { Ionicons } from '@expo/vector-icons';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

export const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { theme, colorScheme: currentColorScheme } = useTheme();
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const { user, logout } = useAuthStore();
  const {
    colorScheme,
    useSystemTheme,
    language,
    autoSync,
    setColorScheme,
    setUseSystemTheme,
    setLanguage,
    setAutoSync,
  } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleLanguageChange = async (lang: 'tr' | 'en') => {
    await changeLanguage(lang);
    await setLanguage(lang);
  };

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    if (mode === 'system') {
      setUseSystemTheme(true);
    } else {
      setUseSystemTheme(false);
      setColorScheme(mode);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('settings.account')}
          </Text>

          <Card variant="elevated">
            <View style={styles.accountInfo}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.accountDetails}>
                <Text style={[styles.accountName, { color: theme.colors.text }]}>
                  {user?.name || 'User'}
                </Text>
                <Text style={[styles.accountEmail, { color: theme.colors.textSecondary }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('settings.appearance')}
          </Text>

          <Card variant="elevated">
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t('settings.theme')}
            </Text>

            <RadioButton
              label={t('settings.systemDefault')}
              selected={useSystemTheme}
              onPress={() => handleThemeChange('system')}
            />
            <RadioButton
              label={t('settings.lightMode')}
              selected={!useSystemTheme && currentColorScheme === 'light'}
              onPress={() => handleThemeChange('light')}
            />
            <RadioButton
              label={t('settings.darkMode')}
              selected={!useSystemTheme && currentColorScheme === 'dark'}
              onPress={() => handleThemeChange('dark')}
            />
          </Card>

          <Card variant="elevated" style={styles.cardMargin}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t('settings.language')}
            </Text>

            <RadioButton
              label="Türkçe"
              selected={currentLanguage === 'tr'}
              onPress={() => handleLanguageChange('tr')}
            />
            <RadioButton
              label="English"
              selected={currentLanguage === 'en'}
              onPress={() => handleLanguageChange('en')}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('sync.title')}
          </Text>

          <Card variant="elevated">
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setAutoSync(!autoSync)}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons
                  name="sync-outline"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    {t('sync.autoSync')}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                      {t('sync.autoSync')}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.switch,
                  {
                    backgroundColor: autoSync
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    { backgroundColor: '#FFF' },
                    autoSync && styles.switchThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('settings.about')}
          </Text>

          <Card variant="elevated">
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    {t('settings.version')}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    1.0.0
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: theme.colors.error },
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  accountDetails: {
    marginLeft: 16,
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardMargin: {
    marginTop: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});