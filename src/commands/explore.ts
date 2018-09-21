import Telegraf from 'telegraf';
import { promisify } from 'util';
import { emojiDict, sigStr } from '../constants';
const Extra = (Telegraf as any).Extra;

export async function tagsCmd(ctx: any, server: any) {
  const queryBody = {
    aggs: {
      tags: {
        aggs: {
          'result': {
            terms: {
              field: 'tags.name.keyword',
              size: 500
            }
          },
          'tags.name.keyword_count': {
            cardinality: {
              field: 'tags.name.keyword'
            }
          }
        },
        filter: {
          match_all: {}
        }
      }
    },
    size: 0
  }
  const tagsResult = await server.esClient.search({
    body: queryBody,
    index: 'telegram',
    type: 'resource'
  });
  const tagsList = []
  for (const item of tagsResult.aggregations.tags.result['buckets']) {
    if (['channel', 'bot', 'group'].indexOf(item['key']) === -1) {
      tagsList.push('#' + item['key']);
    }
  }
  return ctx.reply('Let me know what tag you want 😜', Extra.markup((m: any) =>
    m.keyboard(tagsList, {
      wrap: (btn, index, currentRow) => currentRow.length === 4
    })
  ))
}
