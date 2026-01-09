import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Vibration,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { Button, Input, Card } from '@components/common';
import { ScannerStackParamList } from '@navigation/types';
import { getProductByBarcode } from '@services/product-service';
import { analyzeBarcodeCategory } from '@utils/barcode-utils';
import { Ionicons } from '@expo/vector-icons';

type BarcodeScannerNavigationProp = StackNavigationProp<ScannerStackParamList, 'ScannerMain'>;

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export const BarcodeScannerScreen = () => {
  const navigation = useNavigation<BarcodeScannerNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [torch, setTorch] = useState(false);

  const lastScannedRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || data === lastScannedRef.current) return;

    setScanned(true);
    lastScannedRef.current = data;
    Vibration.vibrate(100);

    await searchProduct(data);

    scanTimeoutRef.current = setTimeout(() => {
      setScanned(false);
      lastScannedRef.current = '';
    }, 2000);
  };

  const searchProduct = async (barcodeValue: string) => {
    setLoading(true);
    try {
      const product = await getProductByBarcode(barcodeValue.trim());

      if (product) {
        Alert.alert(
          t('scanner.productFound'),
          `${product.name}\n${t('products.stock')}: ${product.stock}`,
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.view'),
              onPress: () => {
                navigation.navigate('ProductDetail', { productId: product.id });
              },
            },
          ]
        );
      } else {
        // Barkoddan kategori tahmin et
        const barcodeInfo = analyzeBarcodeCategory(barcodeValue);
        
        Alert.alert(
          t('scanner.productNotFound'),
          t('scanner.addProductPrompt'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('products.addProduct'),
              onPress: () => {
                navigation.navigate('AddEditProduct', {
                  product: {
                    barcode: barcodeValue.trim(),
                    category: barcodeInfo.categoryKey,
                  },
                });
              },
            },
          ]
        );
      }

      setBarcode('');
    } catch (error) {
      Alert.alert(t('common.error'), t('scanner.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (!barcode.trim()) {
      Alert.alert(t('common.error'), t('scanner.enterBarcode'));
      return;
    }
    searchProduct(barcode.trim());
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <Text style={{ color: theme.colors.text }}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted || isManualMode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Card variant="elevated" style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="barcode-outline" size={64} color={theme.colors.primary} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('scanner.barcodeSearch')}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('scanner.manualEntry')}
            </Text>

            <View style={styles.inputWrapper}>
              <Input
                label={t('scanner.barcode')}
                placeholder="1234567890123"
                value={barcode}
                onChangeText={setBarcode}
                keyboardType="number-pad"
                icon="barcode-outline"
                containerStyle={styles.input}
              />
            </View>

            <Button
              title={t('common.search')}
              onPress={handleManualSearch}
              loading={loading}
              fullWidth
              size="large"
              icon={<Ionicons name="search-outline" size={20} color="#FFF" />}
            />

            {!permission.granted ? (
              <Button
                title={t('scanner.enableCamera')}
                onPress={requestPermission}
                variant="outline"
                fullWidth
                style={styles.cameraButton}
                icon={<Ionicons name="camera-outline" size={20} color={theme.colors.primary} />}
              />
            ) : (
              <Button
                title={t('scanner.useCamera')}
                onPress={() => setIsManualMode(false)}
                variant="outline"
                fullWidth
                style={styles.cameraButton}
                icon={<Ionicons name="camera-outline" size={20} color={theme.colors.primary} />}
              />
            )}
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
              'code39',
              'code93',
              'itf14',
              'codabar',
              'qr',
            ],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
      )}

      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {!scanned && <View style={styles.scanLine} />}
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.instructionText}>
            {scanned ? t('scanner.processing') : t('scanner.alignBarcode')}
          </Text>
        </View>
      </View>

      <SafeAreaView style={styles.controls} edges={['top']}>
        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.controlButton, { backgroundColor: torch ? theme.colors.primary : 'rgba(0,0,0,0.5)' }]}
            onPress={() => setTorch(!torch)}
          >
            <Ionicons name={torch ? 'flash' : 'flash-outline'} size={24} color="#FFF" />
          </Pressable>
          <Pressable
            style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => setIsManualMode(true)}
          >
            <Ionicons name="keypad-outline" size={24} color="#FFF" />
          </Pressable>
        </View>
      </SafeAreaView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>{t('scanner.searching')}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { 
    flex: 1, 
    paddingHorizontal: 20,
    justifyContent: 'center' 
  },
  card: { 
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 32, textAlign: 'center', paddingHorizontal: 8 },
  inputWrapper: {
    width: '100%',
    marginBottom: 8,
  },
  input: { 
    marginBottom: 0,
  },
  cameraButton: { marginTop: 12 },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayMiddle: { flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scanArea: { width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE * 0.6, position: 'relative' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', paddingTop: 32 },
  instructionText: { color: '#FFF', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#FFF' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  scanLine: { position: 'absolute', top: '50%', left: 8, right: 8, height: 2, backgroundColor: '#00FF00', opacity: 0.8 },
  controls: { position: 'absolute', top: 0, left: 0, right: 0 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 },
  controlButton: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  loadingBox: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  loadingText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
});