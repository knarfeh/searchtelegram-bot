import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
import { getCmd, submitCmd } from './handle_tg';
import { starCmd, unstarCmd } from './user';
import { searchCmd } from './search';

export async function allText(ctx: any, server: any) {
  const payloadList = ctx.message.text.split(/_(.+)/, 2)
  if (payloadList.length === 2) {
    const fnMap = {
      '/get': getCmd,
      '/star': starCmd,
      '/submit': submitCmd,
      '/unstar': unstarCmd
    };
    if (Object.keys(fnMap).includes(payloadList[0])) {
      ctx.message.text = `${payloadList[1]}`
      await fnMap[`${payloadList[0]}`](ctx, server)
      return
    }
  }
  if (ctx.message.text.startsWith('#')) {
    ctx.message.text = '*' + ctx.message.text;
  }
  ctx.message.text = `/search ${ctx.message.text}`;
  await searchCmd(ctx, server);
}
