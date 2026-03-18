// 支持的语言
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh';

// 翻译字典类型
type TranslationDictionary = Record<string, any>;

// 静态导入翻译文件（确保初始化时就有数据）
import zhTranslations from './locales/zh.json';
import enTranslations from './locales/en.json';

const translations: Record<Locale, TranslationDictionary> = {
  zh: zhTranslations,
  en: enTranslations
};

// 获取翻译
export function t(key: string, locale: Locale = defaultLocale): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 回退到默认语言
      value = translations[defaultLocale];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // 返回 key 作为最后回退
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// 检测浏览器语言
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language.split('-')[0];
  return locales.includes(browserLang as Locale) 
    ? (browserLang as Locale) 
    : defaultLocale;
}

// 获取存储的语言偏好
export function getStoredLocale(): Locale | null {
  if (typeof localStorage === 'undefined') return null;
  
  const stored = localStorage.getItem('locale');
  return locales.includes(stored as Locale) ? (stored as Locale) : null;
}

// 存储语言偏好
export function setStoredLocale(locale: Locale): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}