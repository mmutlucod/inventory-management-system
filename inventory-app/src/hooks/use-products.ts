import { useState, useEffect, useCallback } from 'react';
import { Product } from '../database';
import {
  getAllProducts,
  getProductById,
  searchProducts,
  filterProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductsByCategory,
  getCategories,
  getProductStatistics,
} from '@services/product-service';
import { CreateProductInput, UpdateProductInput, ProductFilters } from '../types/product';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchProducts(searchTerm);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);
  const filter = useCallback(async (filters: ProductFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await filterProducts(filters);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Filter failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (input: CreateProductInput) => {
    try {
      setError(null);
      const newProduct = await createProduct(input);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, input: UpdateProductInput) => {
    try {
      setError(null);
      const updatedProduct = await updateProduct(id, input);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
      throw err;
    }
  }, []);


  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    search,
    filter,
    create,
    update,
    remove,
  };
};
export const useProduct = (productId: string | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product, loading, error, reload: loadProduct };
};

export const useLowStockProducts = (threshold: number = 10) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLowStockProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLowStockProducts(threshold);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load low stock products:', err);
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    loadLowStockProducts();
  }, [loadLowStockProducts]);

  return {
    products,
    loading,
    reload: loadLowStockProducts,
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {categories, loading, reload: loadCategories };
};


export const useProductStatistics = () => {
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {statistics, loading, reload: loadStatistics };
};