import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface PickedImage {
  uri: string;
  type: string;
  name: string;
  size?: number;
}


import { getCurrentLanguage, translate } from '@localization/i18n';

const t = (key: string): string => {
  return translate(key, getCurrentLanguage());
};

const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      t('imagePicker.permissionRequired'),
      t('imagePicker.cameraPermissionMessage'),
      [{ text: t('common.ok') }]
    );
    return false;
  }
  
  return true;
};

const requestGalleryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      t('imagePicker.permissionRequired'),
      t('imagePicker.galleryPermissionMessage'),
      [{ text: t('common.ok') }]
    );
    return false;
  }
  
  return true;
};

export const pickImageFromGallery = async (): Promise<PickedImage | null> => {
  const hasPermission = await requestGalleryPermission();
  
  if (!hasPermission) {
    return null;
  }
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    allowsMultipleSelection: false,
  });
  
  if (result.canceled) {
    return null;
  }
  
  const asset = result.assets[0];
  
  if (asset.fileSize) {
    const maxSize = 5 * 1024 * 1024;
    if (asset.fileSize > maxSize) {
      Alert.alert(
        t('common.error'),
        t('imagePicker.imageSizeError')
      );
      return null;
    }
  }
  
  return {
    uri: asset.uri,
    type: asset.type || 'image',
    name: asset.fileName || `image_${Date.now()}.jpg`,
    size: asset.fileSize,
  };
};

export const takePhotoWithCamera = async (): Promise<PickedImage | null> => {
  const hasPermission = await requestCameraPermission();
  
  if (!hasPermission) {
    return null;
  }
  
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
  
  if (result.canceled) {
    return null;
  }
  
  const asset = result.assets[0];
  
  return {
    uri: asset.uri,
    type: asset.type || 'image',
    name: `photo_${Date.now()}.jpg`,
    size: asset.fileSize,
  };
};

export const showImagePickerOptions = (
  onGallery: () => void,
  onCamera: () => void
): void => {
  Alert.alert(
    t('imagePicker.selectImage'),
    t('imagePicker.chooseOption'),
    [
      {
        text: t('imagePicker.takePhoto'),
        onPress: onCamera,
      },
      {
        text: t('imagePicker.chooseFromGallery'),
        onPress: onGallery,
      },
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
};