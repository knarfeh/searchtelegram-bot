import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
import Telegraf from 'telegraf';
import { getCmd, submitCmd } from './handle_tg';
import { starCmd, unstarCmd } from './user';
import { searchCmd } from './search';
import { langCmd } from './settings';
import { tagsCmd } from './explore';
const Extra = (Telegraf as any).Extra;

export async function allText(ctx: any, server: any) {
  const payloadList = ctx.message.text.split(/_(.+)/, 2)
  console.dir(payloadList)
  if (payloadList.length === 2) {
    const fnMap = {
      '/get': getCmd,
      '/lang': langCmd,
      '/search': searchCmd,
      '/star': starCmd,
      '/submit': submitCmd,
      '/unstar': unstarCmd,
    };
    if (Object.keys(fnMap).includes(payloadList[0])) {
      ctx.message.text = `${payloadList.slice(1).join('_')}`
      await fnMap[`${payloadList[0]}`](ctx, server)
      return
    }
  }
  if (ctx.message.text.includes(ctx.i18n.t('menu_main_search'))) {
      ctx.message.text = `/search`;
      await searchCmd(ctx, server);
      return;
  } else if (ctx.message.text.includes(ctx.i18n.t('menu_main_tags'))) {
      await tagsCmd(ctx, server);
      return;
  } else {
    // TODO
  }

  ctx.message.text = `/search ${ctx.message.text}`;
  await searchCmd(ctx, server);
}

export async function startCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/start ', '').replace('/start', '');
  server.redisClient.SADD('stats:unique-user', ctx.message.from.id)
  console.log(`[start]sender: ${ctx.message.from.username}/${ctx.message.from.id}, payload: ${payload}\n`)
  const response = `
${ctx.i18n.t('start_info')}

/start Get help information

/search [searchstring] [tagstring] Search group, channel, bot, people
  e.g. /search telegram #group#people#tag3

/get [telegramID] Get details with telegram ID
  e.g. /get searchtelegramdotcombot

/submit [telegramID] Submit new item
  e.g. /submit searchtelegramchannel

/schannel [searchstring] Search channel
  e.g. /schannel telegram

/sgroup [searchstring] Search group
  e.g. /sgroup python

/sbot [searchstring] Search bot
  e.g. /sbot picture

/lang Set language

/donate Support this project
`
  ctx.reply(response, Extra.HTML().webPreview(false).markup((m: any) =>
    m.inlineKeyboard([
      m.urlButton('🌐 ', 'https://searchtelegram.com'),
      m.urlButton('📢 ', 'https://t.me/SearchTelegramChannel'),
      m.urlButton('👥 ', 'https://t.me/SearchTelegramGroup'),
      m.callbackButton(` 🔎 `, `search_all`),
    ])
    // .keyboard([
    //   `1. ${ctx.i18n.t('menu_main_search')}`,
    //   `2. ${ctx.i18n.t('menu_main_tags')}`,
    //   `3. ${ctx.i18n.t('menu_main_lang')}`,
    //   `4. ${ctx.i18n.t('menu_main_help')}`,
    //   `5. ${ctx.i18n.t('menu_main_donate')}`
    // ], {
    //   wrap: (btn, index, currentRow) => currentRow.length === 3
    // })
    )
  )
}

export async function helpCmd(ctx: any, server: any) {
  ctx.message.text = `/start`;
  await startCmd(ctx, server);
  return;
}

export async function donateCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/donate', '').replace('/donate', '');
  server.redisClient.SADD('stats:donate-unique-user', ctx.message.from.id)
  console.log(`[donate]sender: ${ctx.message.from.username}/${ctx.message.from.id}, payload: ${payload}\n`)
  const response = `
${ctx.i18n.t('donate_paragraph')}

*BTC*: 1Aa8ZXPbzoyHGp9SmnWjSaNq56py3jCj96

*ETH*: 0x3A149665Fb7fe1b44892D50eCA0bd2BdcD21C85D

*ADA*: DdzFFzCqrhsrCe7b5113ra8ifVs64r6AmLKefzqgDxytw6k3Dw5XjKZLMAXsNPsnDfFSYPcWbj5TsFq4akDqV423TaC4d4xxLfptr6Y2
`
  ctx.reply(response, Extra.HTML().webPreview(false).markdown(true).markup((m: any) =>
    m.inlineKeyboard([
      m.urlButton('🌐 ', 'https://searchtelegram.com'),
      m.urlButton('📢 ', 'https://t.me/SearchTelegramChannel'),
      m.urlButton('👥 ', 'https://t.me/SearchTelegramGroup'),
      m.callbackButton(` 🔎 `, `search_all`),
    ])
  ))
}
