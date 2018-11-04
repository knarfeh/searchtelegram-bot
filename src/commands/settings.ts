import Telegraf from 'telegraf';
import { langFlag } from '../constants';
const Extra = (Telegraf as any).Extra;

export async function langCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/lang', '').replace('/lang', '');
  if (payload === '') {
    const lang = ctx.i18n.locale();
    const desp = `${ctx.i18n.t('current_lang')}: ${ctx.i18n.t(lang)} ${langFlag[lang]}`
    ctx.reply(desp, Extra.HTML(true).webPreview(false).markup((m: any) =>
      m.inlineKeyboard([
        m.callbackButton(`${ctx.i18n.t('zh_cn')} ${langFlag['zh_cn']}`, `setlang_zh_cn`),
        m.callbackButton(`${ctx.i18n.t('en')} ${langFlag['en']}`, `setlang_en`),
      ], { columns: 2 })
    ))
  } else {
    console.log('TODO')
  }
}
