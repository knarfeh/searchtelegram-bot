import Telegraf from 'telegraf';
import * as Scene from 'telegraf/scenes/base';
import * as Stage from 'telegraf/stage';
import { searchCmd } from '../commands';
import { server } from './../index';
const leave = Stage.leave
const Extra = (Telegraf as any).Extra;

export const schannelScene = new Scene('schannel')

schannelScene.enter(async (ctx: any) => {
  const payload = ctx.message.text.replace('/schannel ', '').replace('/schannel', '');
  if (payload !== '') {
    ctx.message.text = `/search ${payload}#channel`
    await searchCmd(ctx, server);
  } else {
    ctx.reply('Ok, tell me what channel are you searching for', Extra.markup((m: any) =>
      m.keyboard(['Cancel'])
    ));
  }
})
schannelScene.command('back', leave())
schannelScene.command('exit', leave())
schannelScene.hears('Cancel', leave())
schannelScene.leave((ctx) => ctx.reply('Bye'))
schannelScene.on('text', async (ctx: any) => {
  ctx.message.text = `/search ${ctx.message.text}#channel`
  await searchCmd(ctx, server);
})
schannelScene.on('message', (ctx) => ctx.reply('Only text messages please'))
