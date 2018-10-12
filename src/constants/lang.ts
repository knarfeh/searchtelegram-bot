import * as path from 'path';
const I18n = require('telegraf-i18n');

export const langFlag = {
  en: '🇬🇧',
  zh_cn: '🇨🇳',
}

export const i18n = new I18n({
  allowMissing: true,
  defaultLanguage: 'zh_cn',
  directory: path.resolve('/app/dist', 'locales'),
  sessionName: 'session',
  useSession: true,
})
