import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { useAuthStore } from '@store/auth-store';
import { useProduct } from '@hooks/use-products';
import { useStockMovements } from '@hooks/use-stock-movements';
import { Card, LoadingSpinner, Button } from '@components/common';
import { StockBadge } from '@components/product';
import { ProductsStackParamList } from '@navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDateTime } from '@utils/date-formatter';
import { deleteProduct } from '@services/product-service';

type ProductDetailNavigationProp = StackNavigationProp<ProductsStackParamList, 'ProductDetail'>;
type ProductDetailRouteProp = RouteProp<ProductsStackParamList, 'ProductDetail'>;

export const ProductDetailScreen = () => {
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { productId } = route.params;
  const { product, loading, reload: reloadProduct } = useProduct(productId);
  const { movements, loading: movementsLoading, reload: reloadMovements } = useStockMovements(productId);

  useFocusEffect(
    useCallback(() => {
      reloadProduct();
      reloadMovements();
    }, [])
  );

  const handleEdit = () => {
    if (product) {
      navigation.navigate('AddEditProduct', { productId: product.id, product });
    }
  };

  const handleStockUpdate = () => {
    navigation.navigate('StockUpdate', { productId });
  };

  const handleDelete = () => {
    Alert.alert(
      t('products.deleteProduct'),
      t('products.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(productId);
              Alert.alert(t('common.success'), t('products.productDeleted'));
              navigation.goBack();
            } catch (error) {
              Alert.alert(t('common.error'), t('common.operationFailed'));
            }
          },
        },
      ]
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          {user?.role === 'Admin' && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, theme, product, user]);

  if (loading && !product) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>{t('products.noProducts')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="image-outline" size={64} color={theme.colors.textDisabled} />
          </View>
        )}

        <Card variant="elevated" style={styles.infoCard}>
          <Text style={[styles.productName, { color: theme.colors.text }]}>
            {product.name}
          </Text>

          {product.category && (
            <Text style={[styles.category, { color: theme.colors.textSecondary }]}>
              {t(`categories.${product.category}`)}
            </Text>
          )}

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>
              {formatCurrency(product.price || 0)}
            </Text>
            <StockBadge stock={product.stock} />
          </View>

          {product.barcode && (
            <View style={styles.infoRow}>
              <Ionicons name="barcode-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {product.barcode}
              </Text>
            </View>
          )}

          {product.description && (
            <View style={[styles.descriptionContainer, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                {t('products.description')}
              </Text>
              <Text style={[styles.description, { color: theme.colors.text }]}>
                {product.description}
              </Text>
            </View>
          )}
        </Card>
        <Button
          title={`${t('stock.addStock')} / ${t('stock.removeStock')}`}
          onPress={handleStockUpdate}
          icon={<Ionicons name="swap-horizontal" size={20} color="#FFF" />}
          style={styles.stockButton}
        />

        <Card variant="elevated" style={styles.movementsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('stock.recentMovements')}
          </Text>

          {movementsLoading && movements.length === 0 ? (
            <LoadingSpinner />
          ) : movements.length > 0 ? (
            movements.slice(0, 5).map((movement) => (
              <View
                key={movement.id}
                style={[styles.movementItem, { borderBottomColor: theme.colors.border }]}
              >
                <View style={styles.movementInfo}>
                  <Text
                    style={[
                      styles.movementQuantity,
                      { color: movement.type === 'in' ? theme.colors.success : theme.colors.error },
                    ]}
                  >
                    {movement.formattedQuantity}
                  </Text>
                  {movement.note && (
                    <Text style={[styles.movementNote, { color: theme.colors.textSecondary }]}>
                      {movement.note}
                    </Text>
                  )}
                </View>
                <Text style={[styles.movementDate, { color: theme.colors.textSecondary }]}>
                  {formatDateTime(movement.createdAt)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noMovements, { color: theme.colors.textSecondary }]}>
              {t('stock.noMovements')}
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  headerButton: { marginLeft: 16 },
  image: { width: '100%', height: 250 },
  imagePlaceholder: { width: '100%', height: 250, alignItems: 'center', justifyContent: 'center' },
  infoCard: { margin: 16 },
  productName: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  category: { fontSize: 14, marginBottom: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  price: { fontSize: 28, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, marginLeft: 8 },
  descriptionContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  description: { fontSize: 14, lineHeight: 20 },
  stockButton: { marginHorizontal: 16, marginBottom: 16 },
  movementsCard: { marginHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  movementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  movementInfo: { flex: 1 },
  movementQuantity: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  movementNote: { fontSize: 12 },
  movementDate: { fontSize: 12 },
  noMovements: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
});