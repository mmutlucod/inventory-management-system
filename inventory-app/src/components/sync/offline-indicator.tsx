import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@providers/theme-provider';
import { useNetworkStatus } from '@hooks/use-network-status';
import { useTranslation } from '@localization/use-translation';
import { Ionicons } from '@expo/vector-icons';

export const OfflineIndicator: React.FC = () => {
  const { theme } = useTheme();
  const { isOffline } = useNetworkStatus();
  const { t } = useTranslation();

  if (!isOffline) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.warning },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={16} color="#FFF" />
      <Text style={styles.text}>{t('sync.offline')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});