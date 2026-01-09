import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { useProduct } from '@hooks/use-products';
import { Button, Input, RadioButton, Card, LoadingSpinner } from '@components/common';
import { ProductsStackParamList } from '@navigation/types';
import { addStock, removeStock } from '@services/stock-service';

type StockUpdateNavigationProp = StackNavigationProp<ProductsStackParamList, 'StockUpdate'>;
type StockUpdateRouteProp = RouteProp<ProductsStackParamList, 'StockUpdate'>;

export const StockUpdateScreen = () => {
  const navigation = useNavigation<StockUpdateNavigationProp>();
  const route = useRoute<StockUpdateRouteProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { productId } = route.params;
  const { product, loading: productLoading } = useProduct(productId);
  const [type, setType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const qty = parseInt(quantity);

    if (!qty || qty <= 0) {
      Alert.alert(t('common.error'), t('stock.invalidQuantity'));
      return;
    }

    if (!product) return;

    if (type === 'out' && qty > product.stock) {
      Alert.alert(t('common.error'), t('stock.insufficientStock'));
      return;
    }

    setLoading(true);

    try {
      if (type === 'in') {
        await addStock(productId, qty, note.trim() || undefined);
      } else {
        await removeStock(productId, qty, note.trim() || undefined);
      }

      Alert.alert(t('common.success'), t('stock.stockUpdated'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || t('common.operationFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  if (productLoading) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>{t('products.productNotFound')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" style={styles.productCard}>
          <Text style={[styles.productName, { color: theme.colors.text }]}>
            {product.name}
          </Text>
          <Text style={[styles.currentStock, { color: theme.colors.textSecondary }]}>
            {t('stock.currentStock')}: {product.stock}
          </Text>
        </Card>

        <Card variant="elevated" style={styles.typeCard}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('stock.operationType')}
          </Text>
          <RadioButton
            label={t('stock.stockIn')}
            selected={type === 'in'}
            onPress={() => setType('in')}
          />
          <RadioButton
            label={t('stock.stockOut')}
            selected={type === 'out'}
            onPress={() => setType('out')}
          />
        </Card>

        <Input
          label={t('stock.quantity') + ' *'}
          placeholder="0"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          icon="layers-outline"
        />
        <Input
          label={t('stock.note')}
          placeholder={t('stock.notePlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          style={styles.noteInput}
          icon="document-text-outline"
        />

        <View style={styles.buttonContainer}>
          <Button
            title={t('common.cancel')}
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={t('common.save')}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
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
  productCard: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentStock: {
    fontSize: 14,
  },
  typeCard: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});