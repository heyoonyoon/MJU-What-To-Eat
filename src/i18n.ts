import { ko } from "./locales/ko";
import { en } from "./locales/en";
import { zh } from "./locales/zh";
import { ja } from "./locales/ja";
import { vi } from "./locales/vi";

export type Lang = "ko" | "en" | "zh" | "ja" | "vi";

export const LANG_LABELS: Record<Lang, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  zh: "🇨🇳",
  ja: "🇯🇵",
  vi: "🇻🇳",
};

export const LANGS: Lang[] = ["ko", "en", "zh", "ja", "vi"];

export const t: Record<Lang, Record<string, string>> = {
  ko,
  en,
  zh,
  ja,
  vi,
};

// Category key names in Korean (used as data keys) → i18n key mapping
export const CAT_KEY_MAP: Record<string, string> = {
  전체: "catAll",
  한식: "catKorean",
  일식: "catJapanese",
  중식: "catChinese",
  "간편식·분식": "catSnack",
  "양식·아시안": "catWestern",
};

// Tag key names in Korean → i18n key mapping
export const TAG_KEY_MAP: Record<string, string> = {
  "👤 혼밥": "tagSolo",
  "💸 저렴이": "tagCheap",
  "💪 고단백": "tagProtein",
  "🥗 건강식": "tagHealthy",
};
