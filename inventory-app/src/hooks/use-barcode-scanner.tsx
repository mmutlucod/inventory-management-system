import { useState, useCallback } from 'react';
import { BarCodeScannedCallback } from 'expo-barcode-scanner';
import {
  requestCameraPermission,
  checkCameraPermission,
  findProductByBarcode,
  isValidBarcodeFormat,
} from '@services/barcode-service';
import { Product } from '../database';

export const useBarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const granted = await requestCameraPermission();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      setError('Failed to request camera permission');
      return false;
    }
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const granted = await checkCameraPermission();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      setError('Failed to check camera permission');
      return false;
    }
  }, []);

  const handleBarcodeScan: BarCodeScannedCallback = useCallback(
    async ({ data }) => {
      if (isScanning) return;

      try {
        setIsScanning(true);
        setError(null);
        setScannedBarcode(data);

        if (!isValidBarcodeFormat(data)) {
          setError('Invalid barcode format');
          return;
        }
        const product = await findProductByBarcode(data);
        setScannedProduct(product);
        if (!product) {setError('Product not found');}
      } catch (err: any) {
        setError(err.message || 'Scan failed');
      } finally {
        setTimeout(() => {
          setIsScanning(false);
        }, 2000);
      }
    },
    [isScanning]
  );
  const resetScan = useCallback(() => {
    setScannedProduct(null);
    setScannedBarcode(null);
    setError(null);
    setIsScanning(false);
  }, []);

  return {
    hasPermission,
    scannedProduct,
    scannedBarcode,
    isScanning,
    error,
    requestPermission,
    checkPermission,
    handleBarcodeScan,
    resetScan,
  };
};