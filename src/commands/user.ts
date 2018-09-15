import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';

export async function starCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/star ', '').replace('/star', '');
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:' + payload);
  if (value !== '1') {
    return ctx.reply('Ops, this id does not exist, perhaps you could submit with /submit ' + payload)
  }

  const resourceResult: any = await server.esClient.get({
    id: payload,
    index: 'telegram',
    type: `user_${ctx.message.from.username}`
  }).catch(function (err: any) {
    if (err.status === 404) {
      return server.esClient.create({
        body: {
          star: true
        },
        id: payload,
        index: 'telegram',
        type: `user_${ctx.message.from.username}`,
      })
    } else {
      throw err;
    }
  });

  const tgBody: {[key: string]: any} = resourceResult['_source'];
  console.log('tgBody: ');
  console.dir(tgBody)
  tgBody['star'] = true
  await server.esClient.index({
    body: tgBody,
    id: payload,
    index: 'telegram',
    type: `user_${ctx.message.from.username}`
  })
  ctx.reply(`OK, checkout your collection with /collection`)
}

export async function unstarCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace('/unstar ', '').replace('/unstar', '');
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:' + payload);
  if (value !== '1') {
    return ctx.reply('Ops, this id does not exist, perhaps you could submit with /submit ' + payload)
  }

  const resourceResult: any = await server.esClient.get({
    id: payload,
    index: 'telegram',
    type: `user_${ctx.message.from.username}`
  }).catch(function (err: any) {
    if (err.status === 404) {
      return server.esClient.create({
        body: {
          star: false
        },
        id: payload,
        index: 'telegram',
        type: `user_${ctx.message.from.username}`,
      })
    } else {
      throw err;
    }
  });

  const tgBody: {[key: string]: any} = resourceResult['_source'];
  tgBody['star'] = false
  await server.esClient.index({
    body: tgBody,
    id: payload,
    index: 'telegram',
    type: `user_${ctx.message.from.username}`
  })
  ctx.reply(`OK, checkout your collection with /collection`)
}

export async function collectionCmd(ctx: any, server: any) {
  // const payload = ctx.message.text.replace('/collection ', '').replace('/star', '');
  console.log('TODO: aggragate');
  const resourceResult = await server.esClient.search({
    body: {query: {match_all : {}}},
    index: 'telegram',
    size: 100,
    type: `user_${ctx.message.from.username}`
  })
  let result = `🎉🎉🎉  Your collection\n\n`
  console.log(`resourceResult: ${resourceResult}`)
  for (const hit of resourceResult.hits.hits) {
    if (hit['_source']['star']) {
      result = result + `@${hit['_id']}    /unstar_${hit['_id']} /get_${hit['_id']}\n`
    }
  }
  ctx.reply(result)
}
