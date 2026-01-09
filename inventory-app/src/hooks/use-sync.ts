import { useState, useEffect, useCallback } from 'react';
import {
  syncDatabase,
  getLastSyncTimestamp,
  getPendingChangesCount,
  clearSyncedItems,
} from '@services/sync';
import { useNetworkStatus } from './use-network-status';

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useNetworkStatus();

  const loadSyncData = useCallback(async () => {
    try {
      const timestamp = await getLastSyncTimestamp();
      setLastSyncTime(timestamp);

      const count = await getPendingChangesCount();
      setPendingChanges(count);
    } catch (err) {
      console.error('Failed to load sync data:', err);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!isConnected) {
      setError('No internet connection');
      return { success: false, error: 'No internet connection' };
    }

    try {
      setIsSyncing(true);
      setError(null);

      const result = await syncDatabase();

      if (result.success) {
        const timestamp = await getLastSyncTimestamp();
        setLastSyncTime(timestamp);

        const count = await getPendingChangesCount();
        setPendingChanges(count);
        await clearSyncedItems();
      } else {
        setError(result.error || 'Sync failed');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Sync failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && pendingChanges > 0) {
      syncNow();
    }
  }, [isConnected]);
  useEffect(() => {
    loadSyncData();
  }, [loadSyncData]);

  return {
    isSyncing,
    lastSyncTime,
    pendingChanges,
    error,
    isConnected,
    syncNow,
    reload: loadSyncData,
  };
};