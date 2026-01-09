import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { useAuthStore } from '@store/auth-store';
import { useProducts } from '@hooks/use-products';
import { Input, EmptyState, LoadingSpinner } from '@components/common';
import { ProductCard } from '@components/product';
import { OfflineIndicator } from '@components/sync';
import { ProductsStackParamList } from '@navigation/types';
import { Ionicons } from '@expo/vector-icons';

type ProductListNavigationProp = StackNavigationProp<ProductsStackParamList, 'ProductList'>;

export const ProductListScreen = () => {
  const navigation = useNavigation<ProductListNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { products, loading, loadProducts, search } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');


  useFocusEffect(
    useCallback(() => {
      if (searchQuery.trim().length > 0) {
        search(searchQuery);
      } else {
        loadProducts();
      }
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      search(text);
    } else {
      loadProducts();
    }
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct', {});
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
         user?.role === 'Admin' ? (
          <TouchableOpacity onPress={handleAddProduct} style={styles.headerButton}>
            <Ionicons name="add-circle-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : null
      ),
    });
  }, [navigation, theme, user]);

  if (loading && products.length === 0) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <OfflineIndicator />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Input
            placeholder={t('products.searchProducts')}
            value={searchQuery}
            onChangeText={handleSearch}
            icon="search-outline"
            containerStyle={styles.searchInput}
          />
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                if (searchQuery.trim().length > 0) {
                  search(searchQuery);
                } else {
                  loadProducts();
                }
              }}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title={t('products.noProducts')}
              description={ user?.role === 'Admin' ? t('products.addProductHint') : t('products.noProductsAvailable')}
              actionLabel={ user?.role === 'Admin' ? t('products.addProduct') : undefined}
              onAction={ user?.role === 'Admin' ? handleAddProduct : undefined}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  headerButton: {
    marginRight: 16,
  },
});