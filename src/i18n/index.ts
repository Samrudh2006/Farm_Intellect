import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import type { Language } from "./languages";

const DEFAULT_LANGUAGE: Language = "en";

const localeLoaders: Record<Language, () => Promise<Record<string, string>>> = {
  en: () => import("../locales/en/translation.json").then((m) => m.default as Record<string, string>),
  hi: () => import("../locales/hi/translation.json").then((m) => m.default as Record<string, string>),
  bn: () => import("../locales/bn/translation.json").then((m) => m.default as Record<string, string>),
  te: () => import("../locales/te/translation.json").then((m) => m.default as Record<string, string>),
  ta: () => import("../locales/ta/translation.json").then((m) => m.default as Record<string, string>),
  pa: () => import("../locales/pa/translation.json").then((m) => m.default as Record<string, string>),
  mr: () => import("../locales/mr/translation.json").then((m) => m.default as Record<string, string>),
  gu: () => import("../locales/gu/translation.json").then((m) => m.default as Record<string, string>),
  kn: () => import("../locales/kn/translation.json").then((m) => m.default as Record<string, string>),
  ml: () => import("../locales/ml/translation.json").then((m) => m.default as Record<string, string>),
  or: () => import("../locales/or/translation.json").then((m) => m.default as Record<string, string>),
  as: () => import("../locales/as/translation.json").then((m) => m.default as Record<string, string>),
  ur: () => import("../locales/ur/translation.json").then((m) => m.default as Record<string, string>),
  sa: () => import("../locales/sa/translation.json").then((m) => m.default as Record<string, string>),
  ne: () => import("../locales/ne/translation.json").then((m) => m.default as Record<string, string>),
  sd: () => import("../locales/sd/translation.json").then((m) => m.default as Record<string, string>),
  ks: () => import("../locales/ks/translation.json").then((m) => m.default as Record<string, string>),
  kok: () => import("../locales/kok/translation.json").then((m) => m.default as Record<string, string>),
  doi: () => import("../locales/doi/translation.json").then((m) => m.default as Record<string, string>),
  mai: () => import("../locales/mai/translation.json").then((m) => m.default as Record<string, string>),
  mni: () => import("../locales/mni/translation.json").then((m) => m.default as Record<string, string>),
  sat: () => import("../locales/sat/translation.json").then((m) => m.default as Record<string, string>),
  brx: () => import("../locales/brx/translation.json").then((m) => m.default as Record<string, string>),
};

const loadedLanguages = new Set<string>();

export const loadLanguageResources = async (language: Language) => {
  if (loadedLanguages.has(language)) return;
  const loader = localeLoaders[language] ?? localeLoaders[DEFAULT_LANGUAGE];
  const translation = await loader();
  if (!i18n.hasResourceBundle(language, "translation")) {
    i18n.addResourceBundle(language, "translation", translation, true, true);
  }
  loadedLanguages.add(language);
};

export const initI18n = async () => {
  if (i18n.isInitialized) return i18n;

  await loadLanguageResources(DEFAULT_LANGUAGE);

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: DEFAULT_LANGUAGE,
      fallbackLng: DEFAULT_LANGUAGE,
      resources: {
        [DEFAULT_LANGUAGE]: {
          translation: i18n.getResourceBundle(DEFAULT_LANGUAGE, "translation") || {},
        },
      },
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "app-language",
        caches: ["localStorage"],
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
};

export default i18n;
