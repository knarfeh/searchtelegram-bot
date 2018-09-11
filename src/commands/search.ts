import Telegraf from 'telegraf';
import { promisify } from 'util';
import { emojiDict, sigStr } from './../constants/tg';
import { getResultByActionRes } from '../utils/es';
const Extra = (Telegraf as any).Extra;

export async function searchCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/search ', '').replace('/search', '');
  const { result, totalPage } = await getResultByActionRes(ctx, server, 'search', payload, 1)

  if (totalPage === 0) {
    ctx.reply(result + sigStr)
  } else if (totalPage === 1) {
    ctx.reply(result)
  } else {
    ctx.reply(result + sigStr, Extra.HTML().markup((m: any) =>
    m.inlineKeyboard([
      m.callbackButton('1', 'current_page'),
      m.callbackButton('>>', `next:search_${payload}-1`)
    ])));
  }
}

export async function searchBotCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/s_bot ', '').replace('/s_bot', '');
  ctx.message.text = `/search ${payload}#bot`
  await searchCmd(ctx, server);
}

export async function searchGroupCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/s_group ', '').replace('/s_group', '');
  ctx.message.text = `/search ${payload}#group`
  await searchCmd(ctx, server);
}

export async function searchPeopleCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/s_people ', '').replace('/s_people', '');
  ctx.message.text = `/search ${payload}#people`;
  await searchCmd(ctx, server);
}

export async function searchChannelCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/s_channel ', '').replace('/s_channel', '');
  ctx.message.text = `/search ${payload}#channel`
  await searchCmd(ctx, server);
}
