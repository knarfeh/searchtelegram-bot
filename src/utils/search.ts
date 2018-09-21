import { promisify } from 'util';
import { emojiDict, sigStr, itemPerPage, noTgResponse } from '../constants/tg';
import { IResource } from '../resource';

export async function getResultByActionRes(ctx: any, server: any, action: any, resource: any, thisPage: any) {
  const payload = resource
  let totalPage = 0;
  let result = '';
  console.log(`getResultByActionRes, payload: ${payload}`)
  if (payload === undefined || payload === null || payload === '') {
    ctx.reply('Ok, tell me what are you searching for');
    return
  }
  // if (payload === '*') {
  if (['*', '*#channel', '*#bot', '*#group'].indexOf(payload) > -1) {
    result = noTgResponse;
    totalPage = 0;
    return [noTgResponse, totalPage];
  }
  const isMemberAsync = promisify(server.redisClient.sismember).bind(server.redisClient);
  const value = await isMemberAsync('redisearch:cached-search-string', payload);
  // server.redisClient.SADD('status:search-unique-user', ctx.message.from.username);
  if (value === 1) {
    console.log(`${payload} is cached search string`);
  }
  console.log(`No cache in redis, search in elasticsearch, search str: ${payload}`)
  const splitPayload = payload.split(/#(.+)/)
  const queryString = splitPayload[0]

  server.redisClient.PUBLISH('st_search', queryString);
  let tagString = ''
  if (splitPayload.length === 3) {
    tagString = '#' + splitPayload[1]
  }
  if (!tagString.includes('#')) {
    tagString = ''
  } else {
    const i = tagString.indexOf('#');
    tagString = tagString.substring(i);
  }
  const noSpaceTagsStr = tagString.replace(/ /g, '').replace(/#/g, ' ').trim();
  const tagsSlice = noSpaceTagsStr.split(' ')
  const queryBody: any = {
    _source: [ 'tgid', 'title', 'type', 'desc', 'tags' ],
    from: itemPerPage * (parseInt(thisPage, 10) - 1),
    query: {
      simple_query_string: {
        query: queryString,
      }
    },
    size: itemPerPage,
  }

  if (tagsSlice.length > 0 && tagsSlice[0] !== '') {
    queryBody['post_filter'] = {
      bool: {
        should: [
          {
            terms: {
              'tags.name.keyword': tagsSlice
            }
          }
        ]
      }
    }
  }
  const resourceResults: any = await server.esClient.search({
    body: queryBody,
    index: 'telegram',
    type: 'resource',
  });
  result = `🎉🎉🎉  ${resourceResults.hits.total} results\n\n`
  if (resourceResults.hits.total === 1) {
    result = `🎉🎉🎉  ${resourceResults.hits.total} result\n\n`
  }
  if (resourceResults.hits.total === 0) {
    result = noTgResponse;
    const tgResource: IResource = {
      tgid: queryString,
    }
    const tgResourceString = JSON.stringify(tgResource);
    console.log(`Telegram, ${ctx.message.from.username} submit resource: ${tgResourceString}\n`)
    server.redisClient.PUBLISH('st_submit', '1');
    server.redisClient.LPUSH('st_submit_list', tgResourceString);
  }
  for (const hit of resourceResults.hits.hits) {
    let description = '';
    description = (hit['_source']['desc'] === '') ? 'None' : hit['_source']['desc'];
    let resTagString = '';
    for (const item of hit['_source']['tags']) {
      resTagString = resTagString + '#' + item['name'] + ' '
    }
    const hitStr = `${emojiDict[hit['_source']['type']]} @${hit['_id']}
Description: ${description}
Tags: ${resTagString}
/get_${hit['_id']}

`
    result = result + hitStr;
  }
  const totalRecord = parseInt(resourceResults.hits.total, 10);
  totalPage = totalRecord % itemPerPage === 0 ? totalRecord / itemPerPage : Math.ceil(totalRecord / itemPerPage) ;
  return [result, totalPage]
}
