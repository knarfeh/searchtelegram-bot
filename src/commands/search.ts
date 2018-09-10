import { promisify } from 'util';
import { emojiDict, sigStr } from './../constants/tg';


export async function searchCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace("/search ", "").replace("/search", "");
  if(payload === undefined || payload === null || payload == '') {
    const result = "Please input string for searching (e.g., /search telegram)"
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
}

export async function searchBotCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace("/s_bot ", "").replace("/s_bot", "");
  ctx.message.text = `/search ${payload}#bot`
  await searchCmd(ctx, server);
}

export async function searchGroupCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace("/s_group ", "").replace("/s_group", "");
  ctx.message.text = `/search ${payload}#group`
  await searchCmd(ctx, server);
}

export async function searchPeopleCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace("/s_people ", "").replace("/s_people", "");
  ctx.message.text = `/search ${payload}#people`;
  await searchCmd(ctx, server);
}

export async function searchChannelCmd(ctx: any, server: any) {
  const payload = ctx.message.text.replace("/s_channel ", "").replace("/s_channel", "");
  ctx.message.text = `/search ${payload}#channel`
  await searchCmd(ctx, server);
}
