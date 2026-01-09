export interface Product {
  id: string;
  serverId?: string;
  name: string;
  barcode?: string;
  stock: number;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  isDeleted: boolean;
  syncedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProductInput {
  id: string;
  name: string;
  barcode?: string;
  stock: number;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProductInput {
  name?: string;
  barcode?: string;
  stock?: number;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  updatedAt: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}