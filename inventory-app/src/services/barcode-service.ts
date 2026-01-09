import { BarCodeScanner } from 'expo-barcode-scanner';
import { getProductByBarcode } from './product-service';
import { Product } from '../database';

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Request camera permission error:', error);
    return false;
  }
};

export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await BarCodeScanner.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

export const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    return await getProductByBarcode(barcode);
  } catch (error) {
    console.error('Find product by barcode error:', error);
    return null;
  }
};

export const isValidBarcodeFormat = (barcode: string): boolean => {
  return /^\d{8}$|^\d{12}$|^\d{13}$/.test(barcode);
};