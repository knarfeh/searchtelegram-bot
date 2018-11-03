import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
import { getCmd, submitCmd } from './handle_tg';
import { starCmd, unstarCmd } from './user';
import { searchCmd } from './search';
import { langCmd } from './settings';
import { tagsCmd } from './explore';

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
