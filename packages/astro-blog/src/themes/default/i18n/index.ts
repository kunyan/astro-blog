import en from "./en";
import zhCN from "./zh-CN";

type TranslationKey = keyof typeof en;
type TranslationDict = Record<TranslationKey, string>;

const translations: Record<string, TranslationDict> = {
  en,
  "zh-CN": zhCN,
  zh: zhCN,
};

export function createT(language: string) {
  const fallback = translations.en!;
  const dict =
    translations[language] ??
    translations[language.split("-")[0]!] ??
    fallback;

  return function t(
    key: TranslationKey,
    params?: Record<string, string>,
  ): string {
    let value = dict[key] ?? fallback[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, v);
      }
    }
    return value;
  };
}

export function createDateFormatter(language: string) {
  return function formatDate(date: Date): string {
    return new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };
}
