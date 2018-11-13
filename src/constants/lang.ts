import * as path from 'path';
const I18n = require('telegraf-i18n');

export const langFlag = {
  en: '🇬🇧',
  zh: '🇨🇳',
}

export const i18n = new I18n({
  allowMissing: true,
  defaultLanguage: 'zh',
  directory: path.resolve('/app/dist', 'locales'),
  sessionName: 'session',
  useSession: true,
})
