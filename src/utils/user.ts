import { promisify } from 'util';
import { emojiDict, sigStr, itemPerPage, noTgResponse, resultLine } from '../constants/tg';
import { IResource } from '../resource';

export async function starTG(ctx: any, server: any, tgID: string, username: string) {
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:' + tgID);
  if (value !== '1') {
    return ctx.reply('Ops, this id does not exist, perhaps you could submit with /submit ' + tgID)
  }
  server.redisClient.SADD(`star:${username}`, tgID)

  const resourceResult: any = await server.esClient.get({
    id: tgID,
    index: 'telegram',
    type: `user_${username}`
  }).catch(function (err: any) {
    if (err.status === 404) {
      return server.esClient.create({
        body: {
          star: true
        },
        id: tgID,
        index: 'telegram',
        type: `user_${username}`,
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
    id: tgID,
    index: 'telegram',
    type: `user_${username}`
  })
  ctx.reply(`OK, checkout your collection with /collection`);
}

export async function unstarTG(ctx: any, server: any, tgID: string, username: string) {
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:' + tgID);
  if (value !== '1') {
    return ctx.reply('Ops, this id does not exist, perhaps you could submit with /submit ' + tgID)
  }
  server.redisClient.SREM(`star:${username}`, tgID)

  const resourceResult: any = await server.esClient.get({
    id: tgID,
    index: 'telegram',
    type: `user_${username}`
  }).catch(function (err: any) {
    if (err.status === 404) {
      return server.esClient.create({
        body: {
          star: false
        },
        id: tgID,
        index: 'telegram',
        type: `user_${username}`,
      })
    } else {
      throw err;
    }
  });

  const tgBody: {[key: string]: any} = resourceResult['_source'];
  console.log('tgBody: ');
  console.dir(tgBody)
  tgBody['star'] = false
  await server.esClient.index({
    body: tgBody,
    id: tgID,
    index: 'telegram',
    type: `user_${username}`
  })
  ctx.reply(`OK, checkout your collection with /collection`);
}

export async function thumbUpTG(ctx: any, server: any, tgID: string, username: string) {
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:' + tgID);
  if (value !== '1') {
    return ctx.reply('Ops, this id does not exist, perhaps you could submit with /submit ' + tgID)
  }
  server.redisClient.SADD(`thumbup:${tgID}`, username)
}

export async function unThumbUpTG(ctx: any, server: any, tgID: string, username: string) {
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:' + tgID);
  if (value !== '1') {
    return ctx.reply('Ops, this id does not exist, perhaps you could submit with /submit ' + tgID)
  }
  server.redisClient.SREM(`thumbup:${tgID}`, username)
}
