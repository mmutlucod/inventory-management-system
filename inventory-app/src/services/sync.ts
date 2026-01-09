import { database, Product, SyncQueue, productsCollection, syncQueueCollection } from '../database';
import { Q } from '@nozbe/watermelondb';
import { apiClient } from './api';
import { SyncPullResponse, SyncPushRequest, SyncChanges } from '../types/sync';
import { useAuthStore } from '@store/auth-store';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const LAST_SYNC_KEY = '@last_sync_timestamp';

export const getLastSyncTimestamp = async (): Promise<number> => {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp, 10) : 0;
  } catch {
    return 0;
  }
};

export const setLastSyncTimestamp = async (timestamp: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
  } catch (error) {
    console.error('Failed to save sync timestamp:', error);
  }
};


export const checkNetworkConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};


const toProductSyncDto = (product: Product, newId?: string) => ({
  id: newId || product.serverId,
  name: product.name,
  barcode: product.barcode || null,
  stock: product.stock,
  price: product.price || null,
  category: product.category || null,
  description: product.description || null,
  imageUrl: product.imageUrl || null,
  createdAt: product.createdAt?.getTime() || Date.now(),
  updatedAt: product.updatedAt?.getTime() || Date.now(),
  isDeleted: product.isDeleted,
});

export const pullChanges = async (): Promise<SyncPullResponse | null> => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) throw new Error('No internet connection');

    const lastPulledAt = await getLastSyncTimestamp();
    const response = await apiClient.get<SyncPullResponse>(`/api/sync/pull?lastPulledAt=${lastPulledAt}`);
    return response;
  } catch (error) {
    console.error('Pull changes error:', error);
    throw error;
  }
};

export const applyPulledChanges = async (changes: SyncChanges): Promise<void> => {
  try {
    await database.write(async () => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) return;
      for (const productData of changes.products.created) {
        const existing = await productsCollection
          .query(Q.where('server_id', productData.id))
          .fetch();

        if (existing.length === 0) {
          await productsCollection.create((product: Product) => {
            product.serverId = productData.id;
            product.name = productData.name;
            product.barcode = productData.barcode;
            product.stock = productData.stock;
            product.price = productData.price;
            product.category = productData.category;
            product.description = productData.description;
            product.imageUrl = productData.imageUrl;
            product.userId = userId;
            product.isDeleted = productData.isDeleted;
            product.syncedAt = Date.now();
          });
        }
      }

      for (const productData of changes.products.updated) {
        const existing = await productsCollection
          .query(Q.where('server_id', productData.id))
          .fetch();

        if (existing.length > 0) {
          await existing[0].update((p: Product) => {
            p.name = productData.name;
            p.barcode = productData.barcode;
            p.stock = productData.stock;
            p.price = productData.price;
            p.category = productData.category;
            p.description = productData.description;
            p.imageUrl = productData.imageUrl;
            p.isDeleted = productData.isDeleted;
            p.syncedAt = Date.now();
          });
        }
      }

      for (const productId of changes.products.deleted) {
        const existing = await productsCollection
          .query(Q.where('server_id', productId))
          .fetch();

        if (existing.length > 0) {
          await existing[0].update((p: Product) => {
            p.isDeleted = true;
            p.syncedAt = Date.now();
          });
        }
      }
    });
  } catch (error) {
    console.error('Apply pulled changes error:', error);
    throw error;
  }
};

export const getPendingChanges = async (): Promise<SyncChanges> => {
  try {
    const changes: SyncChanges = {
      products: { created: [], updated: [], deleted: [] },
    };

    const pendingItems = await syncQueueCollection
      .query(Q.where('status', 'pending'))
      .fetch();

    const entityActions = new Map<string, { action: string; item: SyncQueue }>();

    for (const item of pendingItems) {
      const existing = entityActions.get(item.entityId);

      if (!existing) {
        entityActions.set(item.entityId, { action: item.action, item });
      } else {
        if (item.action === 'delete') {
          entityActions.set(item.entityId, { action: 'delete', item });
        } else if (item.action === 'create' && existing.action !== 'delete') {
          entityActions.set(item.entityId, { action: 'create', item });
        }
      }
    }

    for (const [entityId, { action }] of entityActions) {
      if (action === 'delete') {
        try {
          const product = await productsCollection.find(entityId);
          if (product.serverId) {
            changes.products.deleted.push(product.serverId);
          }
        } catch {
        }
        continue;
      }
      try {
        const product = await productsCollection.find(entityId);

        if (action === 'create') {
          if (product.serverId) {
            changes.products.updated.push(toProductSyncDto(product));
          } else {
            const newId = uuidv4();
            changes.products.created.push(toProductSyncDto(product, newId));

            await database.write(async () => {
              await product.update((p: Product) => {
                p.serverId = newId;
              });
            });
          }
        } else if (action === 'update' && product.serverId) {
          changes.products.updated.push(toProductSyncDto(product));
        }
      } catch {
        console.warn(`Product not found for sync: ${entityId}`);
      }
    }

    return changes;
  } catch (error) {
    console.error('Get pending changes error:', error);
    throw error;
  }
};

export const pushChanges = async (): Promise<void> => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) throw new Error('No internet connection');

    const pendingChanges = await getPendingChanges();
    const lastPulledAt = await getLastSyncTimestamp();

    const hasChanges =
      pendingChanges.products.created.length > 0 ||
      pendingChanges.products.updated.length > 0 ||
      pendingChanges.products.deleted.length > 0;

    if (!hasChanges) return;

    console.log('📤 Pushing changes:', JSON.stringify(pendingChanges, null, 2));

    const request: SyncPushRequest = { changes: pendingChanges, lastPulledAt };
    await apiClient.post('/api/sync/push', request);
    await database.write(async () => {
      const pendingItems = await syncQueueCollection
        .query(Q.where('status', 'pending'))
        .fetch();

      for (const item of pendingItems) {
        await item.update((i: SyncQueue) => {
          i.status = 'synced';
        });
      }
    });
  } catch (error) {
    console.error('Push changes error:', error);
    throw error;
  }
};

export const syncDatabase = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) return { success: false, error: 'No internet connection' };
    await pushChanges();
    const response = await pullChanges();

    if (response) {
      await applyPulledChanges(response.changes);
      await setLastSyncTimestamp(response.timestamp);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Sync database error:', error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
};
export const addToSyncQueue = async (
  action: 'create' | 'update' | 'delete',
  entityType: 'product',
  entityId: string,
  payload: any
): Promise<void> => {
  try {
    await database.write(async () => {
      await syncQueueCollection.create((item: SyncQueue) => {
        item.action = action;
        item.entityType = entityType;
        item.entityId = entityId;
        item.payload = JSON.stringify(payload);
        item.status = 'pending';
        item.retryCount = 0;
      });
    });
  } catch (error) {
    console.error('Add to sync queue error:', error);
  }
};

export const getPendingChangesCount = async (): Promise<number> => {
  try {
    return await syncQueueCollection
      .query(Q.where('status', 'pending'))
      .fetchCount();
  } catch {
    return 0;
  }
};

export const clearSyncedItems = async (): Promise<void> => {
  try {
    await database.write(async () => {
      const syncedItems = await syncQueueCollection
        .query(Q.where('status', 'synced'))
        .fetch();

      for (const item of syncedItems) {
        await item.destroyPermanently();
      }
    });
  } catch (error) {
    console.error('Clear synced items error:', error);
  }
};
export const clearAllPendingItems = async (): Promise<void> => {
  try {
    await database.write(async () => {
      const allItems = await syncQueueCollection.query().fetch();
      for (const item of allItems) {
        await item.destroyPermanently();
      }
    });
    console.log('✅ All sync queue items cleared');
  } catch (error) {
    console.error('Clear queue error:', error);
  }
};