import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
import { Resource } from '../../resource';


export async function startCmd(ctx: any, server: any) {
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
}

export async function getCmd(ctx: any, server: any) {
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
}

export async function submitCmd(ctx: any, server: any) {
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
}
