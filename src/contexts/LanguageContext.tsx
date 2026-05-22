import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { Language, languageOptions, isRTL, getScriptFontFamily } from '@/i18n/languages';
import { translations } from '@/i18n/translations';

export type { Language };
export { languageOptions, isRTL };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const nodeOriginalTextRef = useRef(new WeakMap<Text, string>());
  const elementOriginalAttrsRef = useRef(new WeakMap<Element, Partial<Record<'placeholder' | 'title' | 'aria-label', string>>>());
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return languageOptions.some((option) => option.code === saved) ? (saved as Language) : 'en';
  });

  const localePhraseMaps = useMemo(() => {
    const enMap = translations.en;
    const currentMap = translations[language];
    const enToCurrent = new Map<string, string>();
    const currentToEn = new Map<string, string>();
    const enNormalizedSet = new Set<string>();

    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

    for (const [key, enValue] of Object.entries(enMap)) {
      if (!enValue) continue;
      const normalizedEn = normalize(enValue);
      enNormalizedSet.add(normalizedEn);
      const localizedValue = currentMap[key];

      if (localizedValue) {
        const normalizedLocalized = normalize(localizedValue);
        currentToEn.set(normalizedLocalized, enValue);
      }

      if (localizedValue && localizedValue !== enValue) {
        enToCurrent.set(normalizedEn, localizedValue);
      }
    }

    return { enToCurrent, currentToEn, enNormalizedSet };
  }, [language]);

  // Apply RTL and font family when language changes
  useEffect(() => {
    const html = document.documentElement;
    const rtl = isRTL(language);
    
    // Set direction
    html.dir = rtl ? 'rtl' : 'ltr';
    html.lang = language;
    
    // Set font family for the script
    document.body.style.fontFamily = getScriptFontFamily(language);
    
    // Add/remove RTL class for additional styling
    if (rtl) {
      html.classList.add('rtl');
    } else {
      html.classList.remove('rtl');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[language];
    return translation[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    const { enToCurrent, currentToEn, enNormalizedSet } = localePhraseMaps;
    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
    const skippableTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP']);
    const translatableAttributes: Array<'placeholder' | 'title' | 'aria-label'> = ['placeholder', 'title', 'aria-label'];
    const skipCache = new WeakMap<Element, boolean>();

    const isSkippableElement = (element: Element | null): boolean => {
      if (!element) return false;
      const cached = skipCache.get(element);
      if (cached !== undefined) return cached;
      const value = skippableTags.has(element.tagName) ||
        Boolean(element.closest('[data-no-auto-translate], [data-i18n-ignore="true"], [contenteditable="true"], input, textarea, select'));
      skipCache.set(element, value);
      return value;
    };

    const isSkippableNode = (node: Node): boolean => {
      const parent = node.parentElement;
      return isSkippableElement(parent);
    };

    const inferEnglishSource = (text: string): string | null => {
      const trimmed = normalize(text);
      if (!trimmed) return null;
      if (language === 'en') return text;
      if (enNormalizedSet.has(trimmed)) return text;
      return currentToEn.get(trimmed) || null;
    };

    const translateFromEnglish = (englishText: string): string => {
      if (language === 'en') return englishText;
      const normalized = normalize(englishText);
      const translated = enToCurrent.get(normalized);
      if (!translated) return englishText;
      const leading = englishText.match(/^\s*/)?.[0] || '';
      const trailing = englishText.match(/\s*$/)?.[0] || '';
      return `${leading}${translated}${trailing}`;
    };

    const processTextNode = (node: Text) => {
      if (isSkippableNode(node)) return;
      const currentValue = node.nodeValue ?? '';
      const originalMap = nodeOriginalTextRef.current;
      let englishSource = originalMap.get(node);
      if (!englishSource) {
        englishSource = inferEnglishSource(currentValue);
        if (!englishSource) return;
        originalMap.set(node, englishSource);
      }
      const nextValue = translateFromEnglish(englishSource);
      if (currentValue !== nextValue) {
        node.nodeValue = nextValue;
      }
    };

    const processElementAttributes = (el: Element) => {
      if (isSkippableElement(el)) return;
      const attrMapRef = elementOriginalAttrsRef.current;
      const existing = attrMapRef.get(el) || {};
      let changed = false;

      for (const attr of translatableAttributes) {
        if (!el.hasAttribute(attr)) continue;
        const currentValue = el.getAttribute(attr) ?? '';
        let englishSource = existing[attr];
        if (!englishSource) {
          englishSource = inferEnglishSource(currentValue) || undefined;
          if (!englishSource) continue;
          existing[attr] = englishSource;
          changed = true;
        }
        const nextValue = translateFromEnglish(englishSource);
        if (currentValue !== nextValue) {
          el.setAttribute(attr, nextValue);
        }
      }

      if (changed) {
        attrMapRef.set(el, existing);
      }
    };

    const processSubtree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        processTextNode(root as Text);
        return;
      }
      if (root.nodeType === Node.DOCUMENT_NODE) {
        processSubtree(document.body);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const rootElement = root as Element;
      processElementAttributes(rootElement);

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let textNode: Node | null = walker.nextNode();
      while (textNode) {
        processTextNode(textNode as Text);
        textNode = walker.nextNode();
      }

      const attrNodes = rootElement.querySelectorAll('[placeholder], [title], [aria-label]');
      attrNodes.forEach((node) => processElementAttributes(node));
    };

    processSubtree(document.body);

    const pendingNodes = new Set<Node>();
    let rafId: number | null = null;
    const enqueueNode = (node: Node) => {
      pendingNodes.add(node);
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        for (const pendingNode of pendingNodes) {
          processSubtree(pendingNode);
        }
        pendingNodes.clear();
        rafId = null;
      });
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          enqueueNode(mutation.target);
          continue;
        }
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          enqueueNode(mutation.target);
          continue;
        }
        mutation.addedNodes.forEach((addedNode) => enqueueNode(addedNode));
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    });

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [language, localePhraseMaps]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: isRTL(language)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
