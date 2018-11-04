import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
import { starTG, unstarTG } from '../utils';

export async function starCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/star ', '').replace('/star', '');
  await starTG(ctx, server, payload, ctx.message.from.id);
}

export async function unstarCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/unstar ', '').replace('/unstar', '');
  await unstarTG(ctx, server, payload, ctx.message.from.id);
}

export async function collectionCmd(ctx: any, server: any) {
  // const payload = ctx.message.text.replace('/collection ', '').replace('/star', '');
  server.redisClient.SADD('stats:collection-unique-user', ctx.message.from.id)
  server.redisClient.SADD('stats:unique-user', ctx.message.from.id)
  console.log('TODO: aggragate');
  const resourceResult = await server.esClient.search({
    body: { query: { term : { star : true }}},
    index: 'telegram',
    size: 100,
    type: `user_${ctx.message.from.id}`
  })
  let result = `🎉🎉🎉  Your collection\n\n`
  console.log(`resourceResult: ${resourceResult}`)
  for (const hit of resourceResult.hits.hits) {
    if (hit['_source']['star']) {
      result = result + `@${hit['_id']}   /get_${hit['_id']}\n`
    }
  }
  ctx.reply(result)
}
