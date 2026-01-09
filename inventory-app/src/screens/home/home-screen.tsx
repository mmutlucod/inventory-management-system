import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { useAuthStore } from '@store/auth-store';
import { useProductStatistics, useLowStockProducts } from '@hooks/use-products';
import { useSync } from '@hooks/use-sync';
import { Card, LoadingSpinner } from '@components/common';
import { ProductCard } from '@components/product';
import { SyncStatus, OfflineIndicator } from '@components/sync';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@utils/date-formatter';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { statistics, loading: statsLoading, reload: reloadStats } = useProductStatistics();
  const { products: lowStockProducts, loading: lowStockLoading, reload: reloadLowStock } = useLowStockProducts();
  const { syncNow, isSyncing } = useSync();

  const loading = statsLoading || lowStockLoading;

  useFocusEffect(
    useCallback(() => {
      reloadStats();
      reloadLowStock();
    }, [])
  );

  const handleRefresh = async () => {
    await reloadStats();
    await reloadLowStock();
    await syncNow();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <OfflineIndicator />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing} 
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              {t('home.welcome')}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name || user?.email}
            </Text>
          </View>
        </View>

        <SyncStatus />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('home.statistics')}
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="cube-outline"
              label={t('products.totalProducts')}
              value={statistics.totalProducts.toString()}
              color={theme.colors.primary}
            />
            <StatCard
              icon="cash-outline"
              label={t('products.totalValue')}
              value={formatCurrency(statistics.totalValue)}
              color={theme.colors.success}
            />
            <StatCard
              icon="alert-circle-outline"
              label={t('products.lowStock')}
              value={statistics.lowStockCount.toString()}
              color={theme.colors.warning}
            />
            <StatCard
              icon="close-circle-outline"
              label={t('products.outOfStock')}
              value={statistics.outOfStockCount.toString()}
              color={theme.colors.error}
            />
          </View>
        </View>

        {lowStockProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('products.lowStock')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Products' as never)}
              >
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                 {t('common.seeAll')}
                </Text>
              </TouchableOpacity>
            </View>
            {lowStockProducts.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => {
                  navigation.navigate('Products' as never, {
                    screen: 'ProductDetail',
                    params: { productId: product.id },
                  } as never);
                }}
              />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('home.quickActions')}
          </Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="add-circle-outline"
              label={t('products.addProduct')}
              onPress={() => navigation.navigate('Products' as never)}
            />
            <ActionCard
              icon="barcode-outline"
              label={t('scanner.scanBarcode')}
              onPress={() => navigation.navigate('Scanner' as never)}
            />
          </View>
        </View>
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
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </Card>
  );
};

const ActionCard = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();

  return (
    <Card onPress={onPress} variant="elevated" padding={16} style={styles.actionCard}>
      <Ionicons name={icon} size={32} color={theme.colors.primary} />
      <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
        {label}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});