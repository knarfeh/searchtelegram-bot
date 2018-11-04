
export async function deleteCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== 'knarfeh') {
    ctx.reply(`Sorry, but you don't have sufficient permissions.`);
    return;
  };

  const payload = ctx.message.text.replace('/delete ', '').replace('/delete', '');
  console.log(`Delete ${payload} by ${ctx.message.from.username}`)
  await server.esClient.delete({
    id: payload,
    index: 'telegram',
    type: 'resource',
  })
  server.redisClient.expire('tgid:' + payload, 1);
  server.redisClient.expire('redisearch:cached-search-string', 1);
  // TODO: redisearch client drop cmd
  ctx.reply(`${payload} had been deleted`);
}

export function pingCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== 'knarfeh') {
    ctx.reply(`Sorry, but you don't have sufficient permissions.`)
    return;
  };
  const payload = ctx.message.text.replace('/ping ', '').replace('/ping', '');
  server.redisClient.SADD('stats:ping-unique-user', ctx.message.from.id)
  console.log(`ping ${ctx.message.from.username}/${ctx.message.from.id}`);
  ctx.reply(`pong ${payload}`);
}

export function statsCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== 'knarfeh') {
    ctx.reply(`Sorry, but you don't have sufficient permissions.`)
    return;
  };
  server.redisClient.SADD('stats:stats-unique-user', ctx.message.from.id)
  let result = '';
  // process.nextTick( () => {});
  server.redisClient.multi()
    .scard('stats:unique-user')
    .scard('stats:search-unique-user')
    .scard('stats:get-unique-user')
    .scard('stats:submit-unique-user')
    .scard('stats:ping-unique-user')
    .scard('stats:echo-unique-user')
    .scard('stats:stats-unique-user')
    .scard('stats:tags-unique-user')
    .scard('stats:collection-unique-user')
    .smembers('redisearch:cached-search-string')
    .exec(async (err: any, replies: any) => {
        const redisResult = `Unique user: ${replies[0].toString()}
Unique user who input /search: ${replies[1].toString()};
Unique user who input /get: ${replies[2].toString()};
Unique user who input /submit: ${replies[3].toString()};
Unique user who input /ping: ${replies[4].toString()};
Unique user who input /echo: ${replies[5].toString()};
Unique user who input /stats: ${replies[6].toString()};
Unique user who input /tags: ${replies[7].toString()};
Unique user who input /collection: ${replies[8].toString()};
Cached search string: \n${replies[9].toString()}`;
        result = redisResult;
        const docCount  = await server.esClient.count({
          index: 'telegram',
          type: 'resource'
        });
        const tagCount = await server.esClient.search({
          body: {
            aggs: {
              allTags: {
                terms: { field: 'tags.name.keyword' }
              }
            }
          },
          index: 'telegram'
        });
        const botCount = await server.esClient.search({
          body: {post_filter: { bool: { should: [{ terms: { 'tags.name.keyword': ['bot']}}]}}},
          index: 'telegram',
          type: 'resource'
        })
        const channelCount = await server.esClient.search({
          body: {post_filter: { bool: { should: [{ terms: { 'tags.name.keyword': ['channel']}}]}}},
          index: 'telegram',
          type: 'resource'
        })
        const groupCount = await server.esClient.search({
          body: {post_filter: { bool: { should: [{ terms: { 'tags.name.keyword': ['group']}}]}}},
          index: 'telegram',
          type: 'resource'
        })
        const peopleCount = await server.esClient.search(
          {
            body: {post_filter: { bool: { should: [{ terms: { 'tags.name.keyword': ['people']}}]}}},
            index: 'telegram',
            type: 'resource'
          })
        const esResult = `
\nES Document count: ${docCount.count}
Tags count: ${tagCount.aggregations['allTags']['doc_count_error_upper_bound']}
Bot count: ${botCount.hits.total}
Channel count: ${channelCount.hits.total}
Group count: ${groupCount.hits.total}
People count: ${peopleCount.hits.total}
`;
        return ctx.reply(result + esResult);
    });
  ctx.reply(result);
}

export function echoCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== 'knarfeh') {
    return ctx.reply(`Sorry, but you don't have sufficient permissions.`)
  };
  const payload = ctx.message.text.replace('/echo ', '').replace('/echo', '');
  server.redisClient.SADD('stats:echo-unique-user', ctx.message.from.id)
  ctx.reply(payload)
}
