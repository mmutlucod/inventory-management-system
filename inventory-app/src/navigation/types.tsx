import { NavigatorScreenParams } from '@react-navigation/native';
import { Product } from '../database';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type PartialProduct = {
  name?: string;
  barcode?: string;
  stock?: number;
  price?: number;
  category?: string;
  description?: string;
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Scanner: undefined;
  Sync: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
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

export type SyncStackParamList = {
  SyncMain: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
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