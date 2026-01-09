import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { Card } from '@components/common/card';
import { StockBadge } from './stock-badge';
import { Product } from '../../database';
import { formatCurrency } from '@utils/date-formatter';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Card onPress={onPress} variant="elevated" style={styles.card}>
      <View style={styles.container}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text style={{ color: theme.colors.textDisabled, fontSize: 12 }}>
              {t('products.noImage')}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <Text
            style={[styles.name, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          {product.category && (
            <Text
              style={[
                styles.category,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t(`categories.${product.category}`)}
            </Text>
          )}

          <View style={styles.footer}>
            <Text
              style={[styles.price, { color: theme.colors.primary }]}
            >
              {formatCurrency(product.price || 0)}
            </Text>
            <StockBadge stock={product.stock} size="small" />
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
});