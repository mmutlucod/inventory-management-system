import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { useSync } from '@hooks/use-sync';
import { useOfflineQueue } from '@hooks/use-offline-queue';
import { Button, Card } from '@components/common';
import { OfflineIndicator } from '@components/sync';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '@utils/date-formatter';

export const SyncScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    isSyncing,
    lastSyncTime,
    pendingChanges,
    error,
    isConnected,
    syncNow,
    reload,
  } = useSync();
  const { pendingCount, failedCount } = useOfflineQueue();

  const getStatusColor = () => {
    if (error) return theme.colors.error;
    if (pendingChanges > 0) return theme.colors.warning;
    return theme.colors.success;
  };

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    if (error) return 'alert-circle';
    if (isSyncing) return 'sync';
    if (pendingChanges > 0) return 'cloud-upload-outline';
    return 'cloud-done-outline';
  };

  const getStatusText = () => {
    if (error) return error;
    if (isSyncing) return t('sync.syncing');
    if (pendingChanges > 0) return `${pendingChanges} ${t('sync.pendingChanges')}`;
    return t('sync.syncSuccess');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <OfflineIndicator />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={reload}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Card variant="elevated" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name={getStatusIcon()} size={48} color={getStatusColor()} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          <Text style={[styles.lastSync, { color: theme.colors.textSecondary }]}>
            {lastSyncTime
              ? `${t('sync.lastSync')}: ${formatRelativeTime(lastSyncTime)}`
              : t('sync.neverSynced')}
          </Text>
          <Button
            title={t('sync.syncNow')}
            onPress={syncNow}
            loading={isSyncing}
            disabled={!isConnected}
            fullWidth
            style={styles.syncButton}
            icon={<Ionicons name="sync-outline" size={20} color="#FFF" />}
          />
        </Card>

        <View style={styles.statsContainer}>
          <StatCard
            icon="cloud-upload-outline"
            label={t('sync.pendingChanges')}
            value={pendingCount.toString()}
            color={theme.colors.warning}
          />
          <StatCard
            icon="close-circle-outline"
            label={t('sync.failed')}
            value={failedCount.toString()}
            color={theme.colors.error}
          />
        </View>

        <Card variant="elevated" style={styles.connectionCard}>
          <View style={styles.connectionRow}>
            <Ionicons
              name={isConnected ? 'wifi' : 'wifi-outline'}
              size={24}
              color={isConnected ? theme.colors.success : theme.colors.error}
            />
            <View style={styles.connectionInfo}>
              <Text style={[styles.connectionTitle, { color: theme.colors.text }]}>
                {t('sync.internetConnection')}
              </Text>
              <Text style={[styles.connectionStatus, { color: theme.colors.textSecondary }]}>
                {isConnected ? t('sync.online') : t('sync.offline')}
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {t('sync.infoText')}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) => {
  const { theme } = useTheme();
  return (
    <Card variant="elevated" padding={16} style={styles.statCard}>
      <Ionicons name={icon} size={32} color={color} />
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  statusCard: { alignItems: 'center', marginBottom: 16 },
  statusHeader: { alignItems: 'center', marginBottom: 16 },
  statusText: { fontSize: 18, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  lastSync: { fontSize: 14, marginBottom: 16 },
  syncButton: { marginTop: 8 },
  statsContainer: { flexDirection: 'row', marginBottom: 16 },
  statCard: { flex: 1, marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', marginTop: 8 },
  statLabel: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  connectionCard: { marginBottom: 16 },
  connectionRow: { flexDirection: 'row', alignItems: 'center' },
  connectionInfo: { marginLeft: 12, flex: 1 },
  connectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  connectionStatus: { fontSize: 12 },
  infoCard: { marginBottom: 16 },
  infoRow: { flexDirection: 'row' },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, marginLeft: 12 },
});