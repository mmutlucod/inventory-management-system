import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export type SyncAction = 'create' | 'update' | 'delete';
export type SyncEntityType = 'product';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export default class SyncQueue extends Model {
  static table = 'sync_queue';

  @text('action') action!: SyncAction;
  @text('entity_type') entityType!: SyncEntityType;
  @text('entity_id') entityId!: string;
  @text('payload') payload!: string;
  @text('status') status!: SyncStatus;
  @field('retry_count') retryCount!: number;
  @text('error_message') errorMessage?: string;
  @readonly @date('created_at') createdAt!: Date;

  getParsedPayload<T = any>(): T | null {
    try {
      return JSON.parse(this.payload);
    } catch {
      return null;
    }
  }

  get canRetry(): boolean {
    return this.status === 'failed' && this.retryCount < 3;
  }
}