import { Product } from './product';

export interface SyncChanges {
  products: {
    created: Product[];
    updated: Product[];
    deleted: string[];
  };
}

export interface SyncPullResponse {
  changes: SyncChanges;
  timestamp: number;
}

export interface SyncPushRequest {
  changes: SyncChanges;
  lastPulledAt: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  error: string | null;
}

export type SyncActionType = 'create' | 'update' | 'delete';
export type SyncEntityType = 'product';
export type SyncQueueStatus = 'pending' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  action: SyncActionType;
  entityType: SyncEntityType;
  entityId: string;
  payload: string;
  status: SyncQueueStatus;
  retryCount: number;
  errorMessage?: string;
  createdAt: number;
}

export interface ConflictResolution {
  type: 'server_wins' | 'client_wins' | 'merge';
  resolvedData?: any;
}