import { database, StockMovement, Product, stockMovementsCollection, productsCollection } from '@database';
import { Q } from '@nozbe/watermelondb';
import { useAuthStore } from '@store/auth-store';
import { updateProduct } from './product-service';

export const addStock = async (
  productId: string,
  quantity: number,
  note?: string
): Promise<StockMovement> => {
  try {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const product = await productsCollection.find(productId);
    
    const movement = await database.write(async () => {
      return await stockMovementsCollection.create((m: StockMovement) => {
        m.productId = productId;
        m.userId = userId;
        m.quantity = quantity;
        m.type = 'in';
        m.note = note;
      });
    });
    
    await updateProduct(productId, {
      stock: product.stock + quantity,
      updatedAt: Date.now(),
    });
    
    return movement;
  } catch (error) {
    console.error('Add stock error:', error);
    throw error;
  }
};
export const removeStock = async (
  productId: string,
  quantity: number,
  note?: string
): Promise<StockMovement> => {
  try {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const product = await productsCollection.find(productId);
    
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    const movement = await database.write(async () => {
      return await stockMovementsCollection.create((m: StockMovement) => {
        m.productId = productId;
        m.userId = userId;
        m.quantity = quantity;
        m.type = 'out';
        m.note = note;
      });
    });
    
    await updateProduct(productId, {
      stock: product.stock - quantity,
      updatedAt: Date.now(),
    });
    
    return movement;
  } catch (error) {
    console.error('Remove stock error:', error);
    throw error;
  }
};

export const getStockMovementsByProduct = async (
  productId: string
): Promise<StockMovement[]> => {
  try {
    const movements = await stockMovementsCollection
      .query(
        Q.where('product_id', productId),
        Q.sortBy('created_at', Q.desc)
      )
      .fetch();
    
    return movements;
  } catch (error) {
    console.error('Get stock movements error:', error);
    return [];
  }
};

export const getRecentStockMovements = async (limit: number = 10): Promise<StockMovement[]> => {
  try {
    const movements = await stockMovementsCollection
      .query(
        Q.sortBy('created_at', Q.desc),
        Q.take(limit)
      )
      .fetch();
    
    return movements;
  } catch (error) {
    console.error('Get recent stock movements error:', error);
    return [];
  }
};