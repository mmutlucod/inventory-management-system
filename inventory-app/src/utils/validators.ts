export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidBarcode = (barcode: string): boolean => {
  return /^\d{8}$|^\d{13}$/.test(barcode);
};

export const isValidProductName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};
export const isValidPrice = (price: number): boolean => {
  return price >= 0 && price <= 1000000;
};

export const isValidStock = (stock: number): boolean => {
  return Number.isInteger(stock) && stock >= 0 && stock <= 1000000;
};
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};
export const validateLoginForm = (email: string, password: string) => {
  const errors: Record<string, string> = {};
  
  if (!isRequired(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!isRequired(password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
  name?: string
) => {
  const errors: Record<string, string> = {};
  
  if (!isRequired(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!isRequired(password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (!isRequired(confirmPassword)) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (name && name.trim().length > 0 && name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateProductForm = (data: {
  name: string;
  stock: number;
  price?: number;
  barcode?: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!isRequired(data.name)) {
    errors.name = 'Product name is required';
  } else if (!isValidProductName(data.name)) {
    errors.name = 'Product name must be between 2 and 100 characters';
  }
  
  if (!isRequired(data.stock)) {
    errors.stock = 'Stock is required';
  } else if (!isValidStock(data.stock)) {
    errors.stock = 'Invalid stock value';
  }
  
  if (data.price !== undefined && !isValidPrice(data.price)) {
    errors.price = 'Invalid price value';
  }
  
  if (data.barcode && !isValidBarcode(data.barcode)) {
    errors.barcode = 'Invalid barcode format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};