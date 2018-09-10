
export async function deleteCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== "knarfeh") {
    ctx.reply("Sorry, but you don't have sufficient permissions.")
    return;
  };

  const payload = ctx.message.text.replace("/delete ", "").replace("/delete", "");
  console.log(`Delete ${payload} by ${ctx.message.from.username}`)
  await server.esClient.delete({
    index: "telegram",
    type: "resource",
    id: payload
  })
  server.redisClient.expire("tgid:"+payload, 1);
  server.redisClient.expire("redisearch:cached-search-string", 1);
  // TODO: redisearch client drop cmd
  ctx.reply(`${payload} had been deleted`);
}

export function pingCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== "knarfeh") {
    ctx.reply("Sorry, but you don't have sufficient permissions.")
    return;
  };
  const payload = ctx.message.text.replace("/ping ", "").replace("/ping", "");
  server.redisClient.SADD("statu:ping-unique-user", ctx.message.from.username)
  console.log(`ping ${ctx.message.from.username}`);
  ctx.reply(`pong ${payload}`);
}

export function statsCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== "knarfeh") {
    ctx.reply("Sorry, but you don't have sufficient permissions.")
    return;
  };
  let result = "";
  // process.nextTick( () => {});
  server.redisClient.multi()
    .scard("status:unique-user")
    .scard("status:search-unique-user")
    .scard("status:get-unique-user")
    .scard("status:submit-unique-user")
    .scard("status:ping-unique-user")
    .scard("status:echo-unique-user")
    .scard("status:status-unique-user")
    .smembers("redisearch:cached-search-string")
    .exec( async (err: any, replies: any,) => {
        const redisResult = `Unique user: ${replies[0].toString()}
Unique user who input /search: ${replies[1].toString()};
Unique user who input /get: ${replies[2].toString()};
Unique user who input /submit: ${replies[3].toString()};
Unique user who input /ping: ${replies[4].toString()};
Unique user who input /echo: ${replies[5].toString()};
Unique user who input /status: ${replies[6].toString()};
Cached search string: \n${replies[7].toString()}`;
        result = redisResult;
        const docCount  = await server.esClient.count({
          index: 'telegram'
        });
        const tagCount = await server.esClient.search({
          index: 'telegram',
          body: {
            aggs: {
              "allTags": {
                "terms": { "field": "tags.name.keyword" }
              }
            }
          }
        });
        const esResult = `\n\nES Document count: ${docCount.count}
Tags count: ${tagCount.aggregations["allTags"]["doc_count_error_upper_bound"]}`
        return ctx.reply(result+esResult);
    });
  ctx.reply(result);
}

export function echoCmd(ctx: any, server: any) {
  if (ctx.message.from.username !== "knarfeh") {
    return ctx.reply("Sorry, but you don't have sufficient permissions.")
  };
  const payload = ctx.message.text.replace("/echo ", "").replace("/echo", "");
  server.redisClient.SADD("statu:echo-unique-user", ctx.message.from.username)
  ctx.reply(payload)
}

