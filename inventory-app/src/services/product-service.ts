import { database, Product, productsCollection } from '../database';
import { Q } from '@nozbe/watermelondb';
import { addToSyncQueue } from './sync';
import { useAuthStore } from '@store/auth-store';
import { CreateProductInput, UpdateProductInput, ProductFilters } from '../types/product';

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const products = await productsCollection
      .query(
        Q.where('is_deleted', false),
        Q.sortBy('created_at', Q.desc)
      )
      .fetch();
    
    return products;
  } catch (error) {
    console.error('Get all products error:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const product = await productsCollection.find(id);
    return product.isDeleted ? null : product;
  } catch {
    return null;
  }
};

export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const products = await productsCollection
      .query(
        Q.where('barcode', barcode),
        Q.where('is_deleted', false)
      )
      .fetch();
    
    return products.length > 0 ? products[0] : null;
  } catch {
    return null;
  }
};

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const products = await productsCollection
      .query(
        Q.where('is_deleted', false),
        Q.or(
          Q.where('name', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
          Q.where('barcode', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
          Q.where('category', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`))
        ),
        Q.sortBy('name', Q.asc)
      )
      .fetch();
    
    return products;
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};

export const filterProducts = async (filters: ProductFilters): Promise<Product[]> => {
  try {
    let query = productsCollection.query(Q.where('is_deleted', false));
    
    if (filters.search) {
      query = query.extend(
        Q.or(
          Q.where('name', Q.like(`%${Q.sanitizeLikeString(filters.search)}%`)),
          Q.where('barcode', Q.like(`%${Q.sanitizeLikeString(filters.search)}%`))
        )
      );
    }
    
    if (filters.category) {
      query = query.extend(Q.where('category', filters.category));
    }
    
    if (filters.lowStock) {
      query = query.extend(Q.where('stock', Q.lte(10)));
    }
    
    if (filters.outOfStock) {
      query = query.extend(Q.where('stock', 0));
    }
    
    const products = await query.fetch();
    return products;
  } catch (error) {
    console.error('Filter products error:', error);
    return [];
  }
};

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  try {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const product = await database.write(async () => {
      return await productsCollection.create((newProduct: Product) => {
        newProduct.name = input.name;
        newProduct.barcode = input.barcode;
        newProduct.stock = input.stock;
        newProduct.price = input.price;
        newProduct.category = input.category;
        newProduct.description = input.description;
        newProduct.imageUrl = input.imageUrl;
        newProduct.userId = userId;
        newProduct.isDeleted = false;
      });
    });
    
    await addToSyncQueue('create', 'product', product.id, {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      stock: product.stock,
      price: product.price,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt.getTime(),
      updatedAt: product.updatedAt.getTime(),
    });
    
    return product;
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};
export const updateProduct = async (
  id: string,
  input: UpdateProductInput
): Promise<Product> => {
  try {
    const product = await productsCollection.find(id);
    
    const updatedProduct = await database.write(async () => {
      return await product.update((p: Product) => {
        if (input.name !== undefined) p.name = input.name;
        if (input.barcode !== undefined) p.barcode = input.barcode;
        if (input.stock !== undefined) p.stock = input.stock;
        if (input.price !== undefined) p.price = input.price;
        if (input.category !== undefined) p.category = input.category;
        if (input.description !== undefined) p.description = input.description;
        if (input.imageUrl !== undefined) p.imageUrl = input.imageUrl;
      });
    });
    
    await addToSyncQueue('update', 'product', product.id, {
      id: product.id,
      name: updatedProduct.name,
      barcode: updatedProduct.barcode,
      stock: updatedProduct.stock,
      price: updatedProduct.price,
      category: updatedProduct.category,
      description: updatedProduct.description,
      imageUrl: updatedProduct.imageUrl,
      createdAt: updatedProduct.createdAt.getTime(),
      updatedAt: Date.now(),
    });
    
    return updatedProduct;
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};


export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const product = await productsCollection.find(id);
    
    await database.write(async () => {
      await product.update((p: Product) => { p.isDeleted = true;});
    });
    
    await addToSyncQueue('delete', 'product', product.id, {
      id: product.id
    });
    
    console.log(`[ProductService] Product ${product.id} soft deleted and queued for sync`);
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

export const getLowStockProducts = async (threshold: number = 10): Promise<Product[]> => {
  try {
    const products = await productsCollection
      .query(
        Q.where('is_deleted', false),
        Q.where('stock', Q.lte(threshold)),
        Q.sortBy('stock', Q.asc)
      )
      .fetch();
    
    return products;
  } catch (error) {
    console.error('Get low stock products error:', error);
    return [];
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const products = await productsCollection
      .query(
        Q.where('is_deleted', false),
        Q.where('category', category),
        Q.sortBy('name', Q.asc)
      )
      .fetch();
    
    return products;
  } catch (error) {
    console.error('Get products by category error:', error);
    return [];
  }
};

// Get all categories
export const getCategories = async (): Promise<string[]> => {
  try {
    const products = await productsCollection
      .query(
        Q.where('is_deleted', false),
        Q.where('category', Q.notEq(null))
      )
      .fetch();
    
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories as string[];
  } catch (error) {
    console.error('Get categories error:', error);
    return [];
  }
};

// Get statistics
export const getProductStatistics = async () => {
  try {
    const allProducts = await getAllProducts();
    
    const totalProducts = allProducts.length;
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price || 0) * p.stock, 0);
    const lowStockCount = allProducts.filter(p => p.stock <= 10).length;
    const outOfStockCount = allProducts.filter(p => p.stock === 0).length;
    
    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
    };
  } catch (error) {
    console.error('Get product statistics error:', error);
    return {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };
  }
};