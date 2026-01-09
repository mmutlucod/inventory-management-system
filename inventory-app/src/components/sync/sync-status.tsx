import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@providers/theme-provider';
import { useSync } from '@hooks/use-sync';
import { useTranslation } from '@localization/use-translation';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '@utils/date-formatter';

export const SyncStatus: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isSyncing, lastSyncTime, pendingChanges, syncNow } = useSync();

  const getStatusIcon = () => {
    if (isSyncing) return 'sync';
    if (pendingChanges > 0) return 'cloud-upload-outline';
    return 'cloud-done-outline';
  };

  const getStatusColor = () => {
    if (isSyncing) return theme.colors.primary;
    if (pendingChanges > 0) return theme.colors.warning;
    return theme.colors.success;
  };

  const getStatusText = () => {
    if (isSyncing) return t('sync.syncing');
    if (pendingChanges > 0)
      return `${pendingChanges} ${t('sync.pendingChanges')}`;
    return lastSyncTime
      ? `${t('sync.lastSync')}: ${formatRelativeTime(lastSyncTime)}`
      : t('sync.neverSynced');
  };

  return (
    <TouchableOpacity
      onPress={syncNow}
      disabled={isSyncing}
      activeOpacity={0.7}
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Ionicons
        name={getStatusIcon()}
        size={20}
        color={getStatusColor()}
      />
      <Text
        style={[styles.text, { color: theme.colors.textSecondary }]}
      >
        {getStatusText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    marginLeft: 8,
  },
});