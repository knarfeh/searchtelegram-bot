import Telegraf from 'telegraf';
import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
import { IResource } from '../resource';
const Extra = (Telegraf as any).Extra;

export async function startCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/start ', '').replace('/start', '');
  server.redisClient.SADD('stats:unique-user', ctx.message.from.id)
  console.log(`[start]sender: ${ctx.message.from.username}/${ctx.message.from.id}, payload: ${payload}\n`)
  ctx.reply(`
🇬🇧
I will help you search telegram group, channel, bot, people. You can also submit new item, get details with telegram ID

🇨🇳
我可以帮助您搜索电报群组，频道，机器人，用户。您也可以提交新的电报 ID，根据 ID 获取详细信息。

/start Get help information

/search [searchstring] [tagstring] Search group, channel, bot, people
  e.g. /search telegram #group#people#tag3

/get [telegramID] Get details with telegram ID
  e.g. /get searchtelegramdotcombot

/submit [telegramID] Submit new item
  e.g. /submit searchtelegramchannel

/schannel [channelID] Search channel
  e.g. /schannel telegram

/sgroup [groupID] Search group
  e.g. /sgroup python

/sbot [channelID] Search bot
  e.g. /sbot picture
`, Extra.HTML().webPreview(false).markup((m: any) =>
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

export async function getCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/get ', '').replace('/get', '');
  console.log(`[get]sender: ${ctx.message.from.username}/${ctx.message.from.id}, payload: ${payload}`)
  server.redisClient.SADD('stats:get-unique-user', ctx.message.from.id)
  server.redisClient.SADD('stats:unique-user', ctx.message.from.id)

  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const sismemberAsync = promisify(server.redisClient.sismember).bind(server.redisClient);
  const scardAsync = promisify(server.redisClient.scard).bind(server.redisClient);
  const value = await getAsync('tgid:' + payload);
  if (value !== '1') {
    return ctx.reply('Ops, this id does not exist, perhaps you could submit with /submit ' + payload)
  }
  const resourceResult: any = await server.esClient.get({
    id: payload,
    index: 'telegram',
    type: 'resource'
  });
  let description = '';
  description = (resourceResult._source['desc'] === '') ? 'None' : resourceResult._source['desc'];
  let tagString = '';
  for (const item of resourceResult._source['tags']) {
    tagString = tagString + '#' + item['name'] + ' '
  }

  let thumupIcon = '👍';
  let thumupInfo = `thumbup_${resourceResult._source['tgid']}`;
  const thumbIsMember = await sismemberAsync(`thumbup:${resourceResult._source['tgid']}`, ctx.message.from.id);
  if (thumbIsMember === 1) {
    thumupIcon = '👍 (' + (parseInt(await scardAsync(`thumbup:${resourceResult._source['tgid']}`), 10)).toString() + ')';
    thumupInfo = `unthumbup_${resourceResult._source['tgid']}`;
  }
  let starIcon = '⭐';
  let starInfo = `star_${resourceResult._source['tgid']}`
  const sisememberresult = await sismemberAsync(`star:${ctx.message.from.id}`, resourceResult._source['tgid']);
  console.log('sismember result: ', sisememberresult)
  if (sisememberresult === 1) {
    starIcon = '✅'
    starInfo = `unstar_${resourceResult._source['tgid']}`
  }

  return ctx.reply(`\n${emojiDict[resourceResult._source['type']]}\n
@${resourceResult._source['tgid']}
<b>Description</b>: ${description}
<b>Tags</b>: ${tagString}
/star_${resourceResult._source['tgid']}
`, Extra.HTML(true).webPreview(false).markup((m: any) =>
    m.inlineKeyboard([
      m.urlButton('🌐 ', `https://t.me/${resourceResult._source['tgid']}`),
      // m.callbackButton(starIcon, starInfo),
      m.callbackButton(thumupIcon, thumupInfo),
      // m.callbackButton('💬', 'TODO'),
      m.callbackButton(starIcon, starInfo),
      // m.callbackButton('🚫404', `notfound_${resourceResult._source['tgid']}`),
      // m.callbackButton('🏷️', 'TODO'),
    ])
  ))
}

export async function submitCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/submit ', '').replace('/submit', '');
  console.log(`[submit]sender: ${ctx.message.from.username}/${ctx.message.from.id}, payload: ${payload}`)
  console.log('Add submit unique user');
  server.redisClient.SADD('stats:submit-unique-user', ctx.message.from.id)
  server.redisClient.SADD('stats:unique-user', ctx.message.from.id)
  if (payload === undefined || payload === null || payload === '') {
    const result = 'Please input telegram ID(e.g., /submit telegram)'
    ctx.reply(result);
    return
  }
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:' + payload);
  if (value === '1') {
    return ctx.reply('Ha, this id already exist, you could get detailed information with /get_' + payload)
  }
  const tgResource: IResource = {
    tgid: payload,
  }
  const tgResourceString = JSON.stringify(tgResource);
  console.log(`Telegram, ${ctx.message.from.username}/${ctx.message.from.id} submit resource: ${tgResourceString}\n`)
  server.redisClient.PUBLISH('st_submit', '1');
  server.redisClient.LPUSH('st_submit_list', tgResourceString);
  return ctx.reply('👏 Successfully submitted. If everything goes well, you will be able to search for it after a while.')
}

// export async function voteCmd(ctx: any, server: any) {
// }

// export async function startCmd(ctx: any, server: any) {
// }
