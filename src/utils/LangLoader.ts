type Lang = 'ko' | 'en';
type LangData = Record<string, any>;

class LangLoader {
  private static instance: LangLoader;
  private currentLang: Lang;
  private langData: Record<Lang, LangData | null> = {
    ko: null,
    en: null
  };
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.currentLang = (localStorage.getItem('zentrix-lang') as Lang) || 'ko';
    this.loadLangData(this.currentLang);
  }

  static getInstance(): LangLoader {
    if (!LangLoader.instance) {
      LangLoader.instance = new LangLoader();
    }
    return LangLoader.instance;
  }

  private async loadLangData(lang: Lang): Promise<void> {
    if (this.langData[lang]) return;

    try {
      const module = await import(`../lang/${lang}.json`);
      this.langData[lang] = module.default;
      this.notifyListeners();
    } catch (error) {
      console.error(`Failed to load language data for ${lang}:`, error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  async setLang(lang: Lang): Promise<void> {
    if (lang === this.currentLang) return;

    this.currentLang = lang;
    localStorage.setItem('zentrix-lang', lang);
    await this.loadLangData(lang);
    
    window.dispatchEvent(new Event('languagechange'));
  }

  getCurrentLang(): Lang {
    return this.currentLang;
  }

  getSupportedLangs(): Lang[] {
    return ['ko', 'en'];
  }

  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  t(key: string): string {
    const keys = key.split('.');
    let current: any = this.langData[this.currentLang];
    
    if (!current) {
      console.warn(`Language data not loaded for ${this.currentLang}`);
      return key;
    }
    
    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      current = current[k];
    }
    
    return current;
  }
}

const langLoader = LangLoader.getInstance();

export const setLang = (lang: Lang) => langLoader.setLang(lang);
export const getCurrentLang = () => langLoader.getCurrentLang();
export const getSupportedLangs = () => langLoader.getSupportedLangs();
export const t = (key: string) => langLoader.t(key);
export const addLangChangeListener = (listener: () => void) => langLoader.addListener(listener);