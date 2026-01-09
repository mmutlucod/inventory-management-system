import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage(app);

const uriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.onload = function () {
      resolve(xhr.response);
    };
    
    xhr.onerror = function () {
      reject(new Error('uriToBlob failed'));
    };
    
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};

export const uploadProductImage = async (
  userId: string,
  imageUri: string,
  productId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const extension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${productId}_${timestamp}.${extension}`;
    
    const storageRef = ref(storage, `products/${userId}/${fileName}`);
    const blob = await uriToBlob(imageUri);
    if (blob.size > 5 * 1024 * 1024) {
      throw new Error('Image size exceeds 5MB');
    }
    
    const metadata = {
      contentType: blob.type || 'image/jpeg',
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: timestamp.toString()
      }
    };
    
    await uploadBytes(storageRef, blob, metadata);
    
    if (blob.close) {
      blob.close();
    }
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
    
  } catch (error: any) {
    console.error('[Firebase] Error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
    if (error.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Check Firebase rules.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload canceled');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Network error. Check connection.');
    }
    
    throw new Error(error.message || 'Upload failed');
  }
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid Storage URL');
    }
    
    const filePath = pathMatch[1];
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error('[Firebase] Delete error:', error);
    
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
};