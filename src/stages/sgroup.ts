import Telegraf from 'telegraf';
import * as Scene from 'telegraf/scenes/base';
import * as Stage from 'telegraf/stage';
import { searchCmd } from '../commands';
import { server } from './../index';
const leave = Stage.leave
const Extra = (Telegraf as any).Extra;

export const sgroupScene = new Scene('sgroup')

sgroupScene.enter(async (ctx: any) => {
  const payload = ctx.message.text.replace('/sgroup ', '').replace('/sgroup', '');
  if (payload !== '') {
    ctx.message.text = `/search ${payload}#group`
    await searchCmd(ctx, server);
  } else {
    ctx.reply('Ok, tell me what group are you searching for', Extra.markup((m: any) =>
      m.keyboard(['Cancel'])
    ));
  }
})
sgroupScene.command('back', leave())
sgroupScene.command('exit', leave())
sgroupScene.hears('Cancel', leave())
sgroupScene.leave((ctx) => ctx.reply('Bye'))
sgroupScene.on('text', async (ctx: any) => {
  ctx.reply(ctx.message.text);
  ctx.message.text = `/search ${ctx.message.text}#group`
  await searchCmd(ctx, server);
})
sgroupScene.on('message', (ctx) => ctx.reply('Only text messages please'))
