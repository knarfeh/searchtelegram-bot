import Telegraf from 'telegraf'
import Composer from 'telegraf';
// import * as Markup from 'telegraf/markup';
import Server from './server';
import { Resource } from './resource';
import { promisify } from 'util';
import * as bodybuilder from 'bodybuilder';


const server = new Server(new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: true },
}));
const emojiDict: { [key:string]:string; } = {
  "bot": "🤖",
  "channel": "🔊",
  "group": "👥",
  "people": "👤"
}

const sigStr = "\n\nBy searchtelegram \n@searchtelegramdotcombot   Robot, index of telegram \n@searchtelegramchannel         searchtelegram updates \n@searchtelegrampublic            Public group of searchtelegram"

server.bot.command('start', (ctx: any) => {
  const payload = ctx.message.text.replace("/start ", "").replace("/start", "");
  server.redisClient.SADD("status:unique-user", ctx.message.from.username)
  console.log(`[start]sender: ${ctx.message.from.username}, payload: ${payload}\n`)
  ctx.reply(`
🇬🇧
I will help you search telegram group, channel, bot, people. You can also submit new item, get details with telegram ID

🇨🇳
我可以帮助您搜索电报群组，频道，机器人，用户。您也可以提交新的电报 ID，根据 ID 获取详细信息。

/start Get help information

/search [searchstring] [tagstring] Search group, channel, bot, people
  e.g. /search telegram #group#people#tag3

/get [telegramID] Get details with telegram ID
  e.g. /get searchtelegramdotcombot

/submit [telegramID] Submit new item
  e.g. /submit searchtelegramchannel

/s_channel [channelID] Search channel
  e.g. /s_channel telegram

/s_group [groupID] Search group
  e.g. /s_group python

/s_bot [channelID] Search bot
  e.g. /s_bot picture

Our website: https://searchtelegram.com
`)
})

server.bot.command('get', async (ctx: any) => {
  const payload = ctx.message.text.replace("/get ", "").replace("/get", "");
  console.log("Add get unique user");
  server.redisClient.SADD("statu:get-unique-user", ctx.message.from.username)
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:'+payload);
  if (value != "1") {
    return ctx.reply("Ops, this id does not exist, perhaps you could submit with /submit " + payload)
  }
  const resourceResult: any = await server.esClient.get({
    index: "telegram",
    type: "resource",
    id: payload
  });
  let description = "";
  if(resourceResult._source["desc"] == "") {
    description = "None"
  } else {
    description = resourceResult._source["desc"]
  }

  let tagString = "";
  for (let item of resourceResult._source["tags"]) {
    tagString = tagString + "#" + item["name"] + ""
  }
  return ctx.reply(`\n${emojiDict[resourceResult._source["type"]]}\n
@${resourceResult._source["tgid"]}
Description: ${description}
Tags: ${tagString}
${sigStr}`)
})

server.bot.command('submit', async (ctx: any) => {
  const payload = ctx.message.text.replace("/submit ", "").replace("/submit", "");
  console.log(`[submit]sender: ${ctx.message.from.username}, user id: ${ctx.message.from.id}, payload: ${payload}`)
  console.log("Add submit unique user");
  server.redisClient.SADD("statu:submit-unique-user", ctx.message.from.username)
  if(payload === undefined || payload === null || payload == '') {
    const result = "Please input telegram ID(e.g., /submit telegram)"
    ctx.reply(result);
    return
  }
  const getAsync = promisify(server.redisClient.get).bind(server.redisClient);
  const value = await getAsync('tgid:'+payload);
  if (value == "1") {
    return ctx.reply("Ha, this id already exist, you could get detailed information with /get " + payload)
  }
  var tgResource: Resource = {
    tgid: payload,
  }
  const tgResourceString = JSON.stringify(tgResource);
  console.log(`Telegram, ${ctx.message.from.username} submit resource: ${tgResourceString}\n`)
  server.redisClient.PUBLISH("st_submit", '1');
  server.redisClient.LPUSH("st_submit_list", tgResourceString);
  return ctx.reply("👏 Successfully submitted. If everything goes well, you will be able to search for it after a while.")
})

server.bot.command('search', async (ctx: any) => {
  const payload = ctx.message.text.replace("/search ", "").replace("/search", "");
  if(payload === undefined || payload === null || payload == '') {
    const result = "Please input search string(e.g., /search telegram)"
    ctx.reply(result);
    return
  }
  const isMemberAsync = promisify(server.redisClient.sismember).bind(server.redisClient);
  const value = await isMemberAsync("redisearch:cached-search-string", payload);
  if (value == 1) {
    console.log(`value??? ${value}`);
    // TODO: search client just return ids
    // server.redSearch.createSearch('st_index', {}, (err: any, search: any) => {
    //   search.query(payload).end(function(err: any, ids: any){
    //     if (err) throw err;
    //     console.log(`Search results for ids ${ids}`);
    //     console.dir(ids)
    //   });
    // });
  }
  console.log(`No cache in redis, search in elasticsearch, search str: ${payload}`)
  let splitPayload = payload.split(/#(.+)/)
  const queryString = splitPayload[0]
  let tagString = ""
  if (splitPayload.length == 3) {
    tagString = "#" + splitPayload[1]
  }
  if (!tagString.includes("#")) {
    tagString = ""
  } else {
    const i = tagString.indexOf("#");
    tagString = tagString.substring(i);
  }
  const noSpaceTagsStr = tagString.replace(/ /g, "").replace(/#/g, " ").trim();
  const tagsSlice = noSpaceTagsStr.split(" ")
  let queryBody: any = {
    query: {
      simple_query_string: {
        query: queryString,
      }
    },
    size: 10,
    _source: [
      "tgid",
      "title",
      "type",
      "desc",
      "tags",
    ],
  }

  if (tagsSlice.length > 0 && tagsSlice[0] != "") {
    queryBody["post_filter"] = {
      bool: {
        should: [
          {
            terms: {
              "tags.name.keyword": tagsSlice
            }
          }
        ]
      }
    }
  }
  const resourceResults: any = await server.esClient.search({
    index: "telegram",
    type: "resource",
    body: queryBody,
  });
  let result = `🎉🎉🎉  ${resourceResults.hits.total} results\n\n`
  if (resourceResults.hits.total== 1) {
    result = `🎉🎉🎉  ${resourceResults.hits.total} result\n\n`
  }
  if (resourceResults.hits.total== 0) {
    result = `😱Sorry, but we don't find any result`
  }
  for (const hit of resourceResults.hits.hits) {
    let description = "";
    if (hit["_source"]["desc"] == "") {
      description = "None";
    } else {
      description = hit["_source"]["desc"];
    }
    let tagString = "";
    for (let item of hit["_source"]["tags"]) {
      tagString = tagString + "#" + item["name"] + " "
    }
    let hitStr = `${emojiDict[hit["_source"]["type"]]} @${hit["_id"]} \nDescription: ${description} \nTags: ${tagString}  \n\n`
    result = result + hitStr;
  }
  ctx.reply(result + sigStr);
})

server.bot.command('search_group', (ctx: any) => {
  ctx.reply('TODO: search_group')
})

server.bot.command('search_people', (ctx: any) => {
  ctx.reply('TODO: search_people')
})

server.bot.command('search_channel', (ctx: any) => {
  ctx.reply('TODO: search_channel')
})

// Private. Gathering server info
server.bot.command('delete', async (ctx: any) => {
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
})

server.bot.command('ping', (ctx: any) => {
  if (ctx.message.from.username !== "knarfeh") {
    ctx.reply("Sorry, but you don't have sufficient permissions.")
    return;
  };
  const payload = ctx.message.text.replace("/ping ", "").replace("/ping", "");
  server.redisClient.SADD("statu:ping-unique-user", ctx.message.from.username)
  console.log(`ping ${ctx.message.from.username}`);
  ctx.reply(`pong ${payload}`);
})

server.bot.command('stats', (ctx: any) => {
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
    .exec( async (err, replies,) => {
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
})

server.bot.command('echo', async (ctx: any) => {
  if (ctx.message.from.username !== "knarfeh") {
    return ctx.reply("Sorry, but you don't have sufficient permissions.")
  };
  const payload = ctx.message.text.replace("/echo ", "").replace("/echo", "");
  server.redisClient.SADD("statu:echo-unique-user", ctx.message.from.username)
  ctx.reply(payload)
});

// Handle all kinds of text.
server.bot.on('text', (ctx: any) => {
  ctx.reply('todo: text')
})

