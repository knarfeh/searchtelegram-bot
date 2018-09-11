import Telegraf from 'telegraf';
import { getResultByActionRes } from '../utils/es';
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
  const { result, totalPage } = await getResultByActionRes(ctx, server, 'search', resource, thisPage);
  if (thisPage < 0 || thisPage > totalPage) {
    return ctx.answerCbQuery('')
  }
  if (thisPage === 1 && thisPage < totalPage) {
    ctx.editMessageText(result, Extra.HTML().markup((m: any) => m.inlineKeyboard([
      m.callbackButton(`${thisPage}`, 'current_page'),
      m.callbackButton('>>', `next:${category}-${thisPage}`),
    ])));
  } else if (thisPage === 1 && thisPage >= totalPage) {
    ctx.editMessageText(result, Extra.HTML().markup((m: any) => m.inlineKeyboard([
      m.callbackButton(`${thisPage}`, 'current_page'),
    ])));
  } else if (thisPage > 1 && thisPage < totalPage) {
    ctx.editMessageText(result, Extra.HTML().markup((m: any) => m.inlineKeyboard([
      m.callbackButton('<<', `prev:${category}-${thisPage}`),
      m.callbackButton(`${thisPage}`, 'current_page'),
      m.callbackButton('>>', `next:${category}-${thisPage}`),
    ])));
  } else if (thisPage > 1 && thisPage >= totalPage) {
    ctx.editMessageText(result, Extra.HTML().markup((m: any) => m.inlineKeyboard([
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
