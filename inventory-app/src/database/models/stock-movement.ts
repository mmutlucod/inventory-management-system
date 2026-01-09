import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Product from './product';

export default class StockMovement extends Model {
  static table = 'stock_movements';
  
  static associations: Associations = {
    products: { type: 'belongs_to', key: 'product_id' },
  };

  @text('product_id') productId!: string;
  @text('user_id') userId!: string;
  @field('quantity') quantity!: number;
  @text('type') type!: 'in' | 'out';
  @text('note') note?: string;
  @readonly @date('created_at') createdAt!: Date;

  @relation('products', 'product_id') product: any;

  get isIncoming(): boolean {
    return this.type === 'in';
  }

  get formattedQuantity(): string {
    return this.isIncoming ? `+${this.quantity}` : `-${this.quantity}`;
  }
}