import Telegraf from 'telegraf'
import Server from './server';
import {
  searchCmd, searchPeopleCmd, startCmd, getCmd, submitCmd, deleteCmd, echoCmd,
  statsCmd, pingCmd, processPageCallback, starCmd, unstarCmd, collectionCmd, tagsCmd,
  thumbupCallback, unthumbupCallback, notfoundCallback, starCallback, unstarCallback, langCmd, setLangCallback,
  searchCallback, allText, donateCmd, helpCmd
} from './commands';
import * as Stage from 'telegraf/stage';
import { sgroupScene, sbotScene, schannelScene } from './stages';
import { i18n } from './constants/lang';
const I18n = require('telegraf-i18n');

const RedisSession = require('telegraf-session-redis')
const enter = Stage.enter
export const server = new Server(new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: true },
}));
const stage = new Stage([sgroupScene, sbotScene, schannelScene], { ttl: 15 })
const session = new RedisSession({
  store: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  }
})

server.bot.use(session.middleware());
server.bot.use(i18n.middleware());
server.bot.use(stage.middleware());

server.bot.command('start', (ctx: any) => { startCmd(ctx, server); })
server.bot.command('donate', (ctx: any) => { donateCmd(ctx, server); })
server.bot.command('help', (ctx: any) => { helpCmd(ctx, server); })
// server.bot.command('feedback', (ctx: any) => { feedbackCmd(ctx, server); })

// Handle telegram resource
server.bot.command('submit', async (ctx: any) => { await submitCmd(ctx, server); })
server.bot.command('get', async (ctx: any) => { await getCmd(ctx, server); })
// server.bot.command('vote', async (ctx: any) => { await voteCmd(ctx, server); })

// User
// server.bot.command('tag', async (ctx: any) => { await tagCmd(ctx, server); })
// server.bot.command('untag', async (ctx: any) => { await tagCmd(ctx, server); })
server.bot.command('star', async (ctx: any) => { await starCmd(ctx, server); })
server.bot.command('unstar', async (ctx: any) => { await unstarCmd(ctx, server); })
server.bot.command('collection', async (ctx: any) => { await collectionCmd(ctx, server); })
// server.bot.command('rate', async (ctx: any) => { await rateCmd(ctx, server); })
// server.bot.command('review', async (ctx: any) => { await reviewCmd(ctx, server); })

// Settings
// server.bot.command('settings', async (ctx: any) => { await settingsCmd(ctx, server); })
server.bot.command('lang', async (ctx: any) => { await langCmd(ctx, server); })
// server.bot.command('search_per_page', async (ctx: any) => { await searchPerPageCmd(ctx, server); })
// server.bot.command('collection_per_page', async (ctx: any) => { await collectionPerPageCmd(ctx, server); })
// server.bot.command('search_with_lang', async (ctx: any) => { await searchWithLangCmd(ctx, server); })
// server.bot.command('above17', async (ctx: any) => { await above17Cmd(ctx, server); })

// explore
// server.bot.command('random', async (ctx: any) => { await randomCmd(ctx, server); })
// top liked, reviewd, rated resource
// server.bot.command('top', async (ctx: any) => { await topCmd(ctx, server); })
// server.bot.command('top_bot', async (ctx: any) => { await topBotCmd(ctx, server); })
// server.bot.command('top_channel', async (ctx: any) => { await topChannelCmd(ctx, server); })
// server.bot.command('top_group', async (ctx: any) => { await topGroupCmd(ctx, server); })

// hot search resource
// server.bot.command('hot', async (ctx: any) => { await hotCmd(ctx, server); })
// server.bot.command('hot_bot', async (ctx: any) => { await hotBotCmd(ctx, server); })
// server.bot.command('hot_channel', async (ctx: any) => { await hotChannelCmd(ctx, server); })
// server.bot.command('hot_group', async (ctx: any) => { await hotGroupCmd(ctx, server); })
// server.bot.command('recent', async (ctx: any) => { await recentCmd(ctx, server); })
server.bot.command('tags', async (ctx: any) => { await tagsCmd(ctx, server); })

// Search command
server.bot.command('search', async (ctx: any) => { await searchCmd(ctx, server); })
server.bot.command('sbot', enter('sbot'))
server.bot.command('sgroup', enter('sgroup'));
server.bot.command('schannel', enter('schannel'))
server.bot.command('speople', async (ctx: any) => { await searchPeopleCmd(ctx, server); })

// Private. Gathering server info
// server.bot.command('admin', async (ctx: any) => { await adminCmd(ctx, server); })
server.bot.command('delete', async (ctx: any) => { await deleteCmd(ctx, server); })
server.bot.command('ping', (ctx: any) => { pingCmd(ctx, server); })
server.bot.command('stats', async (ctx: any) => { await statsCmd(ctx, server); })
// server.bot.command('redis', async (ctx: any) => { await redisCmd(ctx, server); })
// server.bot.command('elasticsearch', async (ctx: any) => { await elasticsearchCmd(ctx, server); })
server.bot.command('echo', (ctx: any) => { echoCmd(ctx, server); })

// callback
server.bot.action(/^notfound_(.+)/, async (ctx: any) => { await notfoundCallback(ctx, server); })
server.bot.action(/^unthumbup_(.+)/, async (ctx: any) => { await unthumbupCallback(ctx, server); })
server.bot.action(/^thumbup_(.+)/, async (ctx: any) => { await thumbupCallback(ctx, server); })
server.bot.action(/^unstar_(.+)/, async (ctx: any) => { await unstarCallback(ctx, server); })
server.bot.action(/^star_(.+)/, async (ctx: any) => { await starCallback(ctx, server); })
server.bot.action(/^setlang_(.+)/, async (ctx: any) => { await setLangCallback(ctx, server); })
server.bot.action(/^search_(.+)/, async (ctx: any) => { await searchCallback(ctx, server); })
server.bot.action(/.+/, async (ctx: any) => { await processPageCallback(ctx, server); })

// Handle all kinds of text.
server.bot.on('text', async (ctx: any) => { await allText(ctx, server); })
