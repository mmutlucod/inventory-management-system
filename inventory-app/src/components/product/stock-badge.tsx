import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';

interface StockBadgeProps {
  stock: number;
  size?: 'small' | 'medium' | 'large';
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  stock,
  size = 'medium',
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const getStatus = () => {
    if (stock === 0) return 'out';
    if (stock < 10) return 'low';
    if (stock < 50) return 'medium';
    return 'high';
  };

  const getColor = () => {
    const status = getStatus();
    switch (status) {
      case 'out':
        return theme.colors.stockOut;
      case 'low':
        return theme.colors.stockLow;
      case 'medium':
        return theme.colors.stockMedium;
      default:
        return theme.colors.stockHigh;
    }
  };

  const getLabel = () => {
    const status = getStatus();
    switch (status) {
      case 'out':
        return t('products.outOfStock');
      case 'low':
        return t('products.lowStock');
      default:
        return t('products.inStock');
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 2, paddingHorizontal: 6 };
      case 'large':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 8 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${getColor()}20`,
          borderColor: getColor(),
          ...getPadding(),
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getColor(),
            fontSize: getFontSize(),
          },
        ]}
      >
        {getLabel()} ({stock})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});