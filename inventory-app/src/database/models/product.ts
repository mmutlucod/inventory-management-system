import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Product extends Model {
  static table = 'products';
  
  static associations: Associations = {
    stock_movements: { type: 'has_many', foreignKey: 'product_id' },
  };

  @text('server_id') serverId?: string;
  @text('name') name!: string;
  @text('barcode') barcode?: string;
  @field('stock') stock!: number;
  @field('price') price?: number;
  @text('category') category?: string;
  @text('description') description?: string;
  @text('image_url') imageUrl?: string;
  @text('user_id') userId!: string;
  @field('is_deleted') isDeleted!: boolean;
  @field('synced_at') syncedAt?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('stock_movements') stockMovements: any;

  get stockStatus(): 'high' | 'medium' | 'low' | 'out' {
    if (this.stock === 0) return 'out';
    if (this.stock < 10) return 'low';
    if (this.stock < 50) return 'medium';
    return 'high';
  }
  get formattedPrice(): string {
    return this.price ? `₺${this.price.toFixed(2)}` : '-';
  }
}