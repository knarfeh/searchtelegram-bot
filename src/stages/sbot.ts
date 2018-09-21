import Telegraf from 'telegraf';
import * as Scene from 'telegraf/scenes/base';
import * as Stage from 'telegraf/stage';
import { searchCmd } from '../commands';
import { server } from './../index';
const leave = Stage.leave
const Extra = (Telegraf as any).Extra;

export const sbotScene = new Scene('sbot')

sbotScene.enter(async (ctx: any) => {
  const payload = ctx.message.text.replace('/sbot ', '').replace('/sbot', '');
  if (payload !== '') {
    ctx.message.text = `/search ${payload}#bot`
    await searchCmd(ctx, server);
  } else {
    ctx.reply('Ok, tell me what bot are you searching for', Extra.markup((m: any) =>
      m.keyboard(['Cancel'])
    ));
  }
})
sbotScene.command('back', leave())
sbotScene.command('exit', leave())
sbotScene.hears('Cancel', leave())
sbotScene.leave((ctx) => ctx.reply('Bye'))
sbotScene.on('text', async (ctx: any) => {
  ctx.reply(ctx.message.text);
  ctx.message.text = `/search ${ctx.message.text}#bot`
  await searchCmd(ctx, server);
})
sbotScene.on('message', (ctx) => ctx.reply('Only text messages please'))
