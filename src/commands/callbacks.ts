import Telegraf from 'telegraf';
import { getResultByActionRes, starTG, unstarTG, thumbUpTG, unThumbUpTG } from '../utils';
import { starCmd, } from './user';
import { promisify } from 'util';
const Extra = (Telegraf as any).Extra;

async function paginationEditListByCategory(ctx: any, server: any, operator: string, query: string) {
  const [category, currentPage] = query.split('-');
  const [action, resource] = category.split('_');
  let thisPage = 1;
  if (operator === 'prev') {
    thisPage = parseInt(currentPage, 10) - 1;
  } else if (operator === 'next') {
    thisPage = parseInt(currentPage, 10) + 1
  }
  const [result, totalPage] = await getResultByActionRes(ctx, server, 'search', resource, thisPage);
  if (thisPage < 0 || thisPage > totalPage) {
    return ctx.answerCbQuery('')
  }
  if (thisPage === 1 && thisPage < totalPage) {
    await ctx.editMessageText(result, Extra.webPreview(false).HTML().markup((m: any) => m.inlineKeyboard([
      m.callbackButton(`${thisPage}`, 'current_page'),
      m.callbackButton('>>', `next:${category}-${thisPage}`),
    ])));
  } else if (thisPage === 1 && thisPage >= totalPage) {
    ctx.editMessageText(result, Extra.webPreview(false).HTML().markup((m: any) => m.inlineKeyboard([
      m.callbackButton(`${thisPage}`, 'current_page'),
    ])));
  } else if (thisPage > 1 && thisPage < totalPage) {
    await ctx.editMessageText(result, Extra.webPreview(false).HTML().markup((m: any) => m.inlineKeyboard([
      m.callbackButton('<<', `prev:${category}-${thisPage}`),
      m.callbackButton(`${thisPage}`, 'current_page'),
      m.callbackButton('>>', `next:${category}-${thisPage}`),
    ])));
  } else if (thisPage > 1 && thisPage >= totalPage) {
    await ctx.editMessageText(result, Extra.webPreview(false).HTML().markup((m: any) => m.inlineKeyboard([
      m.callbackButton('<<', `prev:${category}-${thisPage}`),
      m.callbackButton(`${thisPage}`, 'current_page'),
    ])));
  }
  ctx.answerCbQuery('');
}

export async function processCallback(ctx: any, server: any) {
  const [operator, query] = ctx.match[0].split(':');
  if (['prev', 'next'].indexOf(operator) > -1) {
    await paginationEditListByCategory(ctx, server, operator, query);
  } else if (operator === 'current_page') {
    return ctx.answerCbQuery('');
  }
}

export async function starCallback(ctx: any, server: any) {
  const tgID = ctx.match[0].split('_').slice(1).join('_')
  console.log('star tgID: ' + tgID)
  const scardAsync = promisify(server.redisClient.scard).bind(server.redisClient);
  const sismemberAsync = promisify(server.redisClient.sismember).bind(server.redisClient);
  let thumupIcon = '👍';
  let thumupInfo = `thumbup_${tgID}`;
  const thumbIsMember = await sismemberAsync(`thumbup:${tgID}`, ctx.update.callback_query.from.username);
  if (thumbIsMember === 1) {
    thumupIcon = '👍 (' + (parseInt(await scardAsync(`thumbup:${tgID}`), 10)).toString() + ')';
    thumupInfo = `unthumbup_${tgID}`;
  }
  await ctx.editMessageText(ctx.update.callback_query.message.text, Extra.HTML(true).webPreview(false).markup((m: any) =>
    m.inlineKeyboard([
      m.urlButton('🌐 ', `https://t.me/${tgID}`),
      m.callbackButton(thumupIcon, thumupInfo),
      m.callbackButton('✅', `unstar_${tgID}`),
      // m.callbackButton('💬', 'TODO'),
      // m.callbackButton('🚫404', `notfound_${tgID}`),
  ])));
  await ctx.answerCbQuery('');
  return starTG(ctx, server, tgID, ctx.update.callback_query.from.username)
}

export async function unstarCallback(ctx: any, server: any) {
  const tgID = ctx.match[0].split('_').slice(1).join('_')
  const scardAsync = promisify(server.redisClient.scard).bind(server.redisClient);
  const sismemberAsync = promisify(server.redisClient.sismember).bind(server.redisClient);
  let thumupIcon = '👍';
  let thumupInfo = `thumbup_${tgID}`;
  const thumbIsMember = await sismemberAsync(`thumbup:${tgID}`, ctx.update.callback_query.from.username);
  console.log('sismember result: ', thumbIsMember)
  if (thumbIsMember === 1) {
    thumupIcon = '👍 (' + (parseInt(await scardAsync(`thumbup:${tgID}`), 10)).toString() + ')';
    thumupInfo = `unthumbup_${tgID}`;
  }
  await ctx.editMessageText(ctx.update.callback_query.message.text, Extra.HTML(true).webPreview(false).markup((m: any) =>
    m.inlineKeyboard([
      m.urlButton('🌐 ', `https://t.me/${tgID}`),
      m.callbackButton(thumupIcon, thumupInfo),
      m.callbackButton('⭐', `star_${tgID}`),
      // m.callbackButton('💬', 'TODO'),
      // m.callbackButton('🚫404', `notfound_${tgID}`),
  ])));
  await ctx.answerCbQuery('');
  return unstarTG(ctx, server, tgID, ctx.update.callback_query.from.username)
}

export async function thumbupCallback(ctx: any, server: any) {
  const tgID = ctx.match[0].split('_').slice(1).join('_');
  const scardAsync = promisify(server.redisClient.scard).bind(server.redisClient);
  console.log('thumup tgID: ' + tgID)
  const thumupIcon = await scardAsync(`thumbup:${tgID}`);
  const thumupInfo = `unthumbup_${tgID}`;
  let starIcon = '⭐';
  let starInfo = `star_${tgID}`
  const sismemberAsync = promisify(server.redisClient.sismember).bind(server.redisClient);
  const sisememberresult = await sismemberAsync(`star:${ctx.update.callback_query.from.username}`, tgID);
  if (sisememberresult === 1) {
    starIcon = '✅'
    starInfo = `unstar_${tgID}`
  }
  await ctx.editMessageText(ctx.update.callback_query.message.text, Extra.HTML(true).webPreview(false).markup((m: any) =>
  m.inlineKeyboard([
    m.urlButton('🌐 ', `https://t.me/${tgID}`),
    m.callbackButton('👍 (' + (parseInt(thumupIcon, 10) + 1).toString() + ')', thumupInfo),
    m.callbackButton(starIcon, starInfo),
    // m.callbackButton('💬', 'TODO'),
    // m.callbackButton('🚫404', `notfound_${tgID}`),
  ])));
  await ctx.answerCbQuery('');
  // TODO thumbup
  return thumbUpTG(ctx, server, tgID, ctx.update.callback_query.from.username)
}

export async function unthumbupCallback(ctx: any, server: any) {
  const tgID = ctx.match[0].split('_').slice(1).join('_');
  const scardAsync = promisify(server.redisClient.scard).bind(server.redisClient);
  console.log('unthumup tgID: ' + tgID)
  let starIcon = '⭐';
  let starInfo = `star_${tgID}`
  const sismemberAsync = promisify(server.redisClient.sismember).bind(server.redisClient);
  const sisememberresult = await sismemberAsync(`star:${ctx.update.callback_query.from.username}`, tgID);
  if (sisememberresult === 1) {
    starIcon = '✅'
    starInfo = `unstar_${tgID}`
  }
  const thumupIcon = await scardAsync(`thumbup:${tgID}`);
  await ctx.editMessageText(ctx.update.callback_query.message.text, Extra.HTML(true).webPreview(false).markup((m: any) =>
  m.inlineKeyboard([
    m.urlButton('🌐 ', `https://t.me/${tgID}`),
    m.callbackButton('👍 (' + (parseInt(thumupIcon, 10) - 1).toString() + ')', `thumbup_${tgID}`),
    m.callbackButton(starIcon, starInfo),
    // m.callbackButton('💬', 'TODO'),
    // m.callbackButton('🚫404', `notfound_${tgID}`),
  ])));
  await ctx.answerCbQuery('');
  return unThumbUpTG(ctx, server, tgID, ctx.update.callback_query.from.username)
}

export async function notfoundCallback(ctx: any, server: any) {
  const tgID = ctx.match[0].split('_').slice(1).join('_')
  console.log('notfound tgID: ' + tgID)
  return ctx.reply('notfound')
}
