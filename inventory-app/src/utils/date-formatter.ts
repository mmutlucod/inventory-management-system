import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { getCurrentLanguage } from '@localization/i18n';

const getLocale = () => {
  return getCurrentLanguage() === 'tr' ? tr : enUS;
};

export const formatDate = (date: Date | number, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    return format(date, formatStr, { locale: getLocale() });
  } catch {
    return '-';
  }
};

export const formatDateTime = (date: Date | number): string => {
  try {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: getLocale() });
  } catch {
    return '-';
  }
};

export const formatTime = (date: Date | number): string => {
  try {
    return format(date, 'HH:mm', { locale: getLocale() });
  } catch {
    return '-';
  }
};

export const formatRelativeTime = (date: Date | number): string => {
  try {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    
    if (isToday(dateObj)) {
      return formatTime(dateObj);
    }
    
    if (isYesterday(dateObj)) {
      const lang = getCurrentLanguage();
      return lang === 'tr' ? 'Dün' : 'Yesterday';
    }
    
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: getLocale(),
    });
  } catch {
    return '-';
  }
};

export const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  } catch {
    return `₺${amount.toFixed(2)}`;
  }
};

export const formatNumber = (num: number): string => {
  try {
    return new Intl.NumberFormat('tr-TR').format(num);
  } catch {
    return num.toString();
  }
};