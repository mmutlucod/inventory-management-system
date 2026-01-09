import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Text,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { Button, Input } from '@components/common';
import { ProductsStackParamList, ScannerStackParamList } from '@navigation/types';
import { validateProductForm } from '@utils/validators';
import { createProduct, updateProduct } from '@services/product-service';
import { 
  analyzeBarcodeCategory, 
  ALL_CATEGORIES, 
  type CategoryKey 
} from '@utils/barcode-utils';
import { 
  pickImageFromGallery, 
  takePhotoWithCamera, 
  showImagePickerOptions 
} from '@services/image-picker';
import { 
  uploadProductImage, 
  deleteProductImage 
} from '@utils/firebase-config';
import { useAuthStore } from '@store/auth-store';

type AddEditProductNavigationProp = StackNavigationProp<ProductsStackParamList | ScannerStackParamList, 'AddEditProduct'>;
type AddEditProductRouteProp = RouteProp<ProductsStackParamList | ScannerStackParamList, 'AddEditProduct'>;

export const AddEditProductScreen = () => {
  const navigation = useNavigation<AddEditProductNavigationProp>();
  const route = useRoute<AddEditProductRouteProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const userId = useAuthStore(state => state.user?.id);
  
  const productId = route.params?.productId;
  const product = route.params?.product;
  const isEdit = !!productId;

  const [name, setName] = useState(product?.name || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [category, setCategory] = useState<CategoryKey>(product?.category || 'other');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState<string | undefined>(product?.imageUrl);
  const [localImageUri, setLocalImageUri] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (barcode && barcode.length >= 3 && !isEdit) {
      const barcodeInfo = analyzeBarcodeCategory(barcode);
      if (barcodeInfo.categoryKey) {
        setCategory(barcodeInfo.categoryKey as CategoryKey);
      }
    }
  }, [barcode, isEdit]);

  useEffect(() => {
    if (route.params?.product?.barcode && !isEdit) {
      const initialBarcode = route.params.product.barcode;
      const barcodeInfo = analyzeBarcodeCategory(initialBarcode);
      if (barcodeInfo.categoryKey && !route.params.product.category) {
        setCategory(barcodeInfo.categoryKey as CategoryKey);
      }
    }
  }, []);

  const handlePickImage = async (fromCamera: boolean) => {
    try {
      setUploadingImage(true);
      
      const pickedImage = fromCamera 
        ? await takePhotoWithCamera()
        : await pickImageFromGallery();
      
      if (pickedImage) {
        setLocalImageUri(pickedImage.uri);
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        const tempProductId = productId || `temp_${Date.now()}`;
        const downloadUrl = await uploadProductImage(userId, pickedImage.uri, tempProductId);
        
        if (imageUrl) {
          await deleteProductImage(imageUrl).catch(console.warn);
        }
        
        setImageUrl(downloadUrl);
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    Alert.alert(
      t('common.confirm'),
      'Are you sure you want to remove this image?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (imageUrl) {
                await deleteProductImage(imageUrl);
              }
              setImageUrl(undefined);
              setLocalImageUri(undefined);
            } catch (error) {
              console.warn('Failed to delete image:', error);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const validation = validateProductForm({
      name,
      stock: parseInt(stock) || 0,
      price: parseFloat(price) || undefined,
      barcode: barcode || undefined,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const productData = {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        stock: parseInt(stock) || 0,
        price: parseFloat(price) || undefined,
        category: category,
        description: description.trim() || undefined,
        imageUrl: imageUrl,
      };

      if (isEdit && productId) {
        await updateProduct(productId, {
          ...productData,
          updatedAt: Date.now(),
        });
        Alert.alert(t('common.success'), t('products.productUpdated'));
      } else {
        await createProduct({
          id: Date.now().toString(),
          ...productData,
        });
        Alert.alert(t('common.success'), t('products.productAdded'));
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const CategoryPickerModal = () => (
    <Modal
      visible={showCategoryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('products.selectCategory')}
            </Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.categoryList}>
            {ALL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryItem,
                  category === cat && { backgroundColor: theme.colors.primary + '20' }
                ]}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[
                  styles.categoryText,
                  { color: theme.colors.text },
                  category === cat && { color: theme.colors.primary, fontWeight: '600' }
                ]}>
                  {t(`categories.${cat}`)}
                </Text>
                {category === cat && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const ImagePreviewModal = () => (
    <Modal
      visible={showImagePreview}
      transparent
      animationType="fade"
      onRequestClose={() => setShowImagePreview(false)}
    >
      <View style={styles.previewModalOverlay}>
        <TouchableOpacity 
          style={styles.previewCloseArea}
          activeOpacity={1}
          onPress={() => setShowImagePreview(false)}
        >
          <View style={styles.previewHeader}>
            <TouchableOpacity
              style={styles.previewCloseBtn}
              onPress={() => setShowImagePreview(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Image 
            source={{ uri: localImageUri || imageUrl }} 
            style={styles.previewImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.imageSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              {t('products.productImage')}
            </Text>
            
            {(imageUrl || localImageUri) ? (
              <View style={styles.imageCompactContainer}>
                <TouchableOpacity 
                  style={styles.compactImageWrapper}
                  onPress={() => setShowImagePreview(true)}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: localImageUri || imageUrl }} 
                    style={styles.compactImage}
                    resizeMode="cover"
                  />
                  {uploadingImage && (
                    <View style={styles.compactImageOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={[styles.imageActionBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={() => showImagePickerOptions(
                      () => handlePickImage(false),
                      () => handlePickImage(true)
                    )}
                    disabled={uploadingImage}
                  >
                    <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.imageActionText, { color: theme.colors.text }]}>
                      Change
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.imageActionBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={handleRemoveImage}
                    disabled={uploadingImage}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    <Text style={[styles.imageActionText, { color: theme.colors.error }]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.imageCompactPlaceholder, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => showImagePickerOptions(
                  () => handlePickImage(false),
                  () => handlePickImage(true)
                )}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera" size={24} color={theme.colors.textSecondary} />
                    <Text style={[styles.compactPlaceholderText, { color: theme.colors.textSecondary }]}>
                      Add Photo
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Input
            label={`${t('products.name')} *`}
            placeholder={t('products.enterProductName')}
            value={name}
            onChangeText={setName}
            error={errors.name}
            icon="cube-outline"
          />

          <Input
            label={t('products.barcode')}
            placeholder="1234567890123"
            value={barcode}
            onChangeText={setBarcode}
            error={errors.barcode}
            keyboardType="number-pad"
            icon="barcode-outline"
          />

          <View style={styles.inlineInputs}>
            <View style={styles.inlineInputHalf}>
              <Input
                label={`${t('products.stock')} *`}
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                error={errors.stock}
                keyboardType="number-pad"
                icon="layers-outline"
              />
            </View>
            
            <View style={styles.inlineInputHalf}>
              <Input
                label={t('products.price')}
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                error={errors.price}
                keyboardType="decimal-pad"
                icon="cash-outline"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('products.category')} *
            </Text>
            <TouchableOpacity
              style={[styles.categorySelector, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border 
              }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <View style={styles.categorySelectorContent}>
                <Ionicons name="pricetag-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.categoryValue, { color: theme.colors.text }]}>
                  {t(`categories.${category}`)}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Input
            label={t('products.description')}
            placeholder={t('products.productDescription')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            icon="document-text-outline"
          />

          <View style={styles.buttonContainer}>
            <Button
              title={t('common.cancel')}
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={t('common.save')}
              onPress={handleSave}
              loading={loading}
              disabled={uploadingImage}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPickerModal />
      <ImagePreviewModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16 },
  descriptionInput: { height: 100, textAlignVertical: 'top' },
  buttonContainer: { flexDirection: 'row', marginTop: 24, marginBottom: 8 },
  cancelButton: { flex: 1, marginRight: 8 },
  saveButton: { flex: 1, marginLeft: 8 },
  
  imageSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  
  imageCompactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  compactImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  
  compactImage: {
    width: '100%',
    height: '100%',
  },
  
  compactImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  imageActions: {
    flex: 1,
    gap: 8,
  },
  
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  imageCompactPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 10,
  },
  
  compactPlaceholderText: {
    fontSize: 15,
    fontWeight: '500',
  },
  
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  
  previewCloseArea: {
    flex: 1,
  },
  
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 50,
  },
  
  previewCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  previewImage: {
    flex: 1,
    width: '100%',
  },
  
  inlineInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  
  inlineInputHalf: {
    flex: 1,
  },
  
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryValue: { fontSize: 16 },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  categoryList: { padding: 8 },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryText: { fontSize: 16 },
});