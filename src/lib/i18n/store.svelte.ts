import { 
  locales, 
  defaultLocale, 
  detectBrowserLocale, 
  getStoredLocale, 
  setStoredLocale, 
  t
} from './index';
import type { Locale } from './index';

// 使用 Svelte 5 runes 创建响应式状态
class I18nState {
  private _locale = $state<Locale>(defaultLocale);
  private _initialized = $state(false);

  constructor() {
    // 初始化语言检测
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // 优先级：localStorage > 浏览器语言 > 默认语言
    const stored = getStoredLocale();
    if (stored) {
      this._locale = stored;
    } else {
      this._locale = detectBrowserLocale();
    }
    
    // 更新 HTML lang 属性
    document.documentElement.lang = this._locale;
    
    this._initialized = true;
  }

  get locale(): Locale {
    return this._locale;
  }

  set locale(newLocale: Locale) {
    this._locale = newLocale;
    setStoredLocale(newLocale);
    
    // 更新 HTML lang 属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  }

  get initialized(): boolean {
    return this._initialized;
  }

  // 翻译函数
  translate(key: string): string {
    return t(key, this._locale);
  }

  // 切换语言
  toggle() {
    this.locale = this._locale === 'zh' ? 'en' : 'zh';
  }
  
  // 设置特定语言
  setLocale(newLocale: Locale) {
    this.locale = newLocale;
  }
}

// 导出单例实例
export const i18n = new I18nState();

// 便捷翻译函数（响应式）
export function translate(key: string): string {
  return i18n.translate(key);
}