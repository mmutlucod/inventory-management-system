export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.113:5215' 
  : 'http://192.168.1.113:5215';

// Or for iOS Simulator
// export const API_BASE_URL = __DEV__ 
//   ? 'http://localhost:5215'
//   : 'https://your-production-api.com';

export const API_TIMEOUT = 30000; 
export const SYNC_INTERVAL = 15 * 60 * 1000; 
export const MAX_RETRY_COUNT = 3;
export const RETRY_DELAY = 5000; 

export const STOCK_THRESHOLDS = {
  LOW: 10,
  MEDIUM: 50,
  HIGH: 100,
};

export const PAGE_SIZE = 20;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_QUALITY = 0.8;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER: '@user',
  LANGUAGE: '@app_language',
  THEME: '@app_theme',
  LAST_SYNC: '@last_sync',
} as const;

export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

export const BARCODE_TYPES = [
  'ean13',
  'ean8',
  'code128',
  'code39',
  'upc_a',
  'upc_e',
] as const;