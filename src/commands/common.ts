import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
import { getCmd, submitCmd } from './handle_tg';
import { starCmd, unstarCmd } from './user';
import { searchCmd } from './search';

export async function allText(ctx: any, server: any) {
  const payloadList = ctx.message.text.split(/_(.+)/, 2)
  console.log('wft is payloadList???')
  console.dir(payloadList)
  if (payloadList.length === 2) {
    const fnMap = {
      '/get': getCmd,
      '/search': searchCmd,
      '/star': starCmd,
      '/submit': submitCmd,
      '/unstar': unstarCmd
    };
    if (Object.keys(fnMap).includes(payloadList[0])) {
      ctx.message.text = `${payloadList.slice(1).join('_')}`
      console.log('wtf is text???' + ctx.message.text)
      await fnMap[`${payloadList[0]}`](ctx, server)
      return
    }
  }
  ctx.message.text = `/search ${ctx.message.text}`;
  await searchCmd(ctx, server);
}
