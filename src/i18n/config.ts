export const locales = ['zh-CN', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh-CN'

export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en': 'English',
}

export const localeIcons: Record<Locale, string> = {
  'zh-CN': '🇨🇳',
  'en': '🇺🇸',
}
