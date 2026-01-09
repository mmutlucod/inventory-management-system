import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Product from './models/product';
import StockMovement from './models/stock-movement';
import SyncQueue from './models/sync-queue';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'inventory',
  jsi: false,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});
export const database = new Database({
  adapter,
  modelClasses: [Product, StockMovement, SyncQueue],
});

export { Product, StockMovement, SyncQueue };

export const productsCollection = database.get<Product>('products');
export const stockMovementsCollection = database.get<StockMovement>('stock_movements');
export const syncQueueCollection = database.get<SyncQueue>('sync_queue');