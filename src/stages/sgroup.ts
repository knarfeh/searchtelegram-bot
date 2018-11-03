import { emojiDict } from './../constants/tg';
import Telegraf from 'telegraf';
import * as Scene from 'telegraf/scenes/base';
import * as Stage from 'telegraf/stage';
import { searchCmd } from '../commands';
import { server } from './../index';
const leave = Stage.leave
const Extra = (Telegraf as any).Extra;

export const sgroupScene = new Scene('sgroup')

sgroupScene.enter(async (ctx: any) => {
  let payload = '';
  if (ctx.message) {
    payload = ctx.message.text.replace('/sgroup ', '').replace('/sgroup', '');
  }
  if (payload !== '') {
    ctx.message.text = `/search ${payload}#group`
    await searchCmd(ctx, server);
  } else {
    ctx.reply(`Ok, tell me what ${emojiDict['group']} are you searching for`, Extra.HTML(true).webPreview(false).markup((m: any) =>
      m.inlineKeyboard([
        m.callbackButton(` 🔎 ${ctx.i18n.t('search_all')}`, `search_all`),
        m.callbackButton(` 🔎 ${emojiDict['channel']}`, `search_channel`),
        m.callbackButton(` 🔎 ${emojiDict['bot']}`, `search_bot`),
        m.callbackButton(` 🔎 ${emojiDict['group']} (${ctx.i18n.t('count_time')})`, `search_group`),
      ], { columns: 3 })
    ));
  }
})
sgroupScene.command('back', leave())
sgroupScene.command('exit', leave())
sgroupScene.hears('Cancel', leave())
sgroupScene.leave((ctx) => ctx.reply('Bye'))
sgroupScene.on('text', async (ctx: any) => {
  ctx.message.text = `/search ${ctx.message.text}#group`
  await searchCmd(ctx, server);
})
sgroupScene.on('message', (ctx) => ctx.reply('Only text messages please'))
