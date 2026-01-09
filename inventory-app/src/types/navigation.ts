import { NavigatorScreenParams } from '@react-navigation/native';
import { Product } from './product';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};
export type MainTabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined;
  ScannerTab: undefined;
  SyncTab: undefined;
  SettingsTab: undefined;
};

export type PartialProduct = {
  name?: string;
  barcode?: string;
  stock?: number;
  price?: number;
  category?: string;
  description?: string;
};

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  AddEditProduct: { 
    productId?: string; 
    product?: Product | PartialProduct;
  };
  StockUpdate: { productId: string };
};

export type ScannerStackParamList = {
  ScannerMain: undefined;
  ProductDetail: { productId: string };
  AddEditProduct: { 
    productId?: string; 
    product?: Product | PartialProduct;
  };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}