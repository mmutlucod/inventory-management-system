import { useState, useEffect, useCallback } from 'react';
import { getPendingChangesCount } from '@services/sync';
import { syncQueueCollection } from '../database';
import { Q } from '@nozbe/watermelondb';

export const useOfflineQueue = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadQueueStatus = useCallback(async () => {
    try {
      setLoading(true);
      const pending = await getPendingChangesCount();
      setPendingCount(pending);
      const failed = await syncQueueCollection
        .query(Q.where('status', 'failed'))
        .fetchCount();
      setFailedCount(failed);
    } catch (err) {
      console.error('Failed to load queue status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueueStatus();
    const interval = setInterval(loadQueueStatus, 10000);

    return () => clearInterval(interval);
  }, [loadQueueStatus]);

  return {
    pendingCount,
    failedCount,
    loading,
    reload: loadQueueStatus,
    hasPendingChanges: pendingCount > 0,
    hasFailedChanges: failedCount > 0,
  };
};