import { emojiDict } from './../constants/tg';
import Telegraf from 'telegraf';
import * as Scene from 'telegraf/scenes/base';
import * as Stage from 'telegraf/stage';
import { searchCmd } from '../commands';
import { server } from './../index';
const leave = Stage.leave
const Extra = (Telegraf as any).Extra;

export const sbotScene = new Scene('sbot')

sbotScene.enter(async (ctx: any) => {
  let payload = '';
  if (ctx.message) {
    payload = ctx.message.text.replace('/sbot ', '').replace('/sbot', '');
  }
  if (payload !== '') {
    ctx.message.text = `/search ${payload}#bot`
    await searchCmd(ctx, server);
  } else {
    ctx.reply(`Ok, tell me what ${emojiDict['bot']} are you searching for`, Extra.HTML(true).webPreview(false).markup((m: any) =>
      m.inlineKeyboard([
        m.callbackButton(` 🔎 ${ctx.i18n.t('search_all')}`, `search_all`),
        m.callbackButton(` 🔎 ${emojiDict['channel']}`, `search_channel`),
        m.callbackButton(` 🔎 ${emojiDict['group']}`, `search_group`),
        m.callbackButton(` 🔎 ${emojiDict['bot']} (${ctx.i18n.t('count_time')})`, `search_bot`),
      ], { columns: 3 })
    ));
  }
})
sbotScene.command('back', leave())
sbotScene.command('exit', leave())
sbotScene.hears('Cancel', leave())
sbotScene.leave((ctx) => ctx.reply('Bye'))
sbotScene.on('text', async (ctx: any) => {
  ctx.message.text = `/search ${ctx.message.text}#bot`
  await searchCmd(ctx, server);
})
sbotScene.on('message', (ctx) => ctx.reply('Only text messages please'))
