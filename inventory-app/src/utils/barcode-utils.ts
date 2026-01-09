interface BarcodeInfo {
  categoryKey?: string;
}

export const CATEGORY_KEYS = {
  food: 'food',
  beverage: 'beverage',
  cosmetics: 'cosmetics',
  cleaning: 'cleaning',
  electronics: 'electronics',
  stationery: 'stationery',
  clothing: 'clothing',
  health: 'health',
  baby: 'baby',
  pet: 'pet',
  home: 'home',
  automotive: 'automotive',
  sports: 'sports',
  toys: 'toys',
  books: 'books',
  other: 'other',
} as const;

export type CategoryKey = typeof CATEGORY_KEYS[keyof typeof CATEGORY_KEYS];

export const ALL_CATEGORIES: CategoryKey[] = [
  'food',
  'beverage',
  'cosmetics',
  'cleaning',
  'electronics',
  'stationery',
  'clothing',
  'health',
  'baby',
  'pet',
  'home',
  'automotive',
  'sports',
  'toys',
  'books',
  'other',
];

const CATEGORY_PREFIXES: Record<CategoryKey, string[]> = {
  food: [
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
    '80', '81', '82', '83', '84', '85',
  ],
  beverage: ['54', '55', '56', '57'],
  cosmetics: ['30', '31', '32', '33', '34', '35', '36', '37'],
  cleaning: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
  electronics: ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'],
  stationery: ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'],
  clothing: ['50', '51', '52', '53'],
  health: ['38', '39'],
  baby: ['86', '87'],
  pet: ['88', '89'],
  home: ['90', '91', '92', '93'],
  automotive: ['94', '95'],
  sports: ['96', '97'],
  toys: ['98', '99'],
  books: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
  other: [],
};

const TURKISH_CATEGORY_PREFIXES: Record<CategoryKey, string[]> = {
  food: ['8690', '8691', '8692', '8693', '8694'],
  beverage: ['8695', '8696'],
  cosmetics: ['8697'],
  cleaning: ['8698'],
  health: ['86970', '86971'],
  baby: ['86972', '86973'],
  pet: ['86974'],
  home: ['86975', '86976'],
  electronics: ['86977', '86978'],
  clothing: ['86979'],
  stationery: ['86980'],
  automotive: ['86981'],
  sports: ['86982'],
  toys: ['86983'],
  books: ['86984'],
  other: ['8699'],
};

export const analyzeBarcodeCategory = (barcode: string): BarcodeInfo => {
  const info: BarcodeInfo = {};
  
  if (!barcode || barcode.length < 3) {
    return info;
  }

  const prefix2 = barcode.substring(0, 2);

  if (barcode.startsWith('869') && barcode.length >= 4) {
    for (const [category, prefixes] of Object.entries(TURKISH_CATEGORY_PREFIXES)) {
      if (prefixes.some(p => barcode.startsWith(p))) {
        info.categoryKey = category as CategoryKey;
        return info;
      }
    }
  }

  for (const [category, prefixes] of Object.entries(CATEGORY_PREFIXES)) {
    if (prefixes.includes(prefix2)) {
      info.categoryKey = category as CategoryKey;
      break;
    }
  }

  return info;
};

export const validateBarcode = (barcode: string): { isValid: boolean; format?: string } => {
  const cleanBarcode = barcode.replace(/\s/g, '');
  
  if (/^\d{13}$/.test(cleanBarcode)) {
    return { isValid: true, format: 'EAN-13' };
  }
  if (/^\d{12}$/.test(cleanBarcode)) {
    return { isValid: true, format: 'UPC-A' };
  }
  if (/^\d{8}$/.test(cleanBarcode)) {
    return { isValid: true, format: 'EAN-8' };
  }
  if (/^[A-Z0-9]{1,20}$/.test(cleanBarcode)) {
    return { isValid: true, format: 'CODE-128' };
  }
  
  return { isValid: false };
};

// Barkod checksum doğrulama (EAN-13)
export const validateEAN13Checksum = (barcode: string): boolean => {
  if (!/^\d{13}$/.test(barcode)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[12], 10);
};