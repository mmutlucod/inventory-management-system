import { useState, useEffect, useCallback } from 'react';
import { StockMovement } from '../database';
import {
  addStock,
  removeStock,
  getStockMovementsByProduct,
  getRecentStockMovements,
} from '@services/stock-service';

export const useStockMovements = (productId?: string) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = productId
        ? await getStockMovementsByProduct(productId)
        : await getRecentStockMovements();

      setMovements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load movements');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const add = useCallback(
    async (productId: string, quantity: number, note?: string) => {
      try {
        setError(null);
        const movement = await addStock(productId, quantity, note);
        setMovements((prev) => [movement, ...prev]);
        return movement;
      } catch (err: any) {
        setError(err.message || 'Failed to add stock');
        throw err;
      }
    },
    []
  );

  const remove = useCallback(
    async (productId: string, quantity: number, note?: string) => {
      try {
        setError(null);
        const movement = await removeStock(productId, quantity, note);
        setMovements((prev) => [movement, ...prev]);
        return movement;
      } catch (err: any) {
        setError(err.message || 'Failed to remove stock');
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  return {
    movements,
    loading,
    error,
    add,
    remove,
    reload: loadMovements,
  };
};