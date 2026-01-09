import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'barcode', type: 'string', isOptional: true, isIndexed: true },
        { name: 'stock', type: 'number' },
        { name: 'price', type: 'number', isOptional: true },
        { name: 'category', type: 'string', isOptional: true, isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'is_deleted', type: 'boolean', isIndexed: true },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    tableSchema({
      name: 'stock_movements',
      columns: [
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'quantity', type: 'number' },
        { name: 'type', type: 'string', isIndexed: true }, 
        { name: 'note', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
    
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'action', type: 'string' }, 
        { name: 'entity_type', type: 'string' },
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'payload', type: 'string' }, // JSON stringified
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'retry_count', type: 'number' },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
  ],
});