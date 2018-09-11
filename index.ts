import Telegraf from 'telegraf'
import Server from './server';
import {
  searchCmd, searchGroupCmd, searchPeopleCmd, searchChannelCmd, searchBotCmd,
  startCmd, getCmd, submitCmd, deleteCmd, echoCmd,
  statsCmd, pingCmd, pocCmd, processCallback
} from './src/commands';

const server = new Server(new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: true },
}));

server.bot.command('start', (ctx: any) => { startCmd(ctx, server); })

// Handle telegram resource
server.bot.command('get', async (ctx: any) => { await getCmd(ctx, server); })
server.bot.command('submit', async (ctx: any) => { await submitCmd(ctx, server); })
// server.bot.command('vote', async (ctx: any) => { await voteCmd(ctx, server); })

// User
// server.bot.command('tag', async (ctx: any) => { await tagCmd(ctx, server); })
// server.bot.command('untag', async (ctx: any) => { await tagCmd(ctx, server); })
// server.bot.command('star', async (ctx: any) => { await starCmd(ctx, server); })
// server.bot.command('unstar', async (ctx: any) => { await unstarCmd(ctx, server); })
// server.bot.command('collection', async (ctx: any) => { await collectionCmd(ctx, server); })

// Settings
// server.bot.command('settings', async (ctx: any) => { await settingsCmd(ctx, server); })
// server.bot.command('set_lang', async (ctx: any) => { await setCmd(ctx, server); })

// Leaderboard
// server.bot.command('top_bot', async (ctx: any) => { await topBotCmd(ctx, server); })
// server.bot.command('top_channel', async (ctx: any) => { await topChannelCmd(ctx, server); })
// server.bot.command('top_group', async (ctx: any) => { await topGroupCmd(ctx, server); })

// Search command
server.bot.command('search', async (ctx: any) => { await searchCmd(ctx, server); })
server.bot.command('poc', async (ctx: any) => { await pocCmd(ctx, server); })
server.bot.command('s_bot', async (ctx: any) => { await searchBotCmd(ctx, server); })
server.bot.command('s_group', async (ctx: any) => { await searchGroupCmd(ctx, server); })
server.bot.command('s_people', async (ctx: any) => { await searchPeopleCmd(ctx, server); })
server.bot.command('s_channel', async (ctx: any) => { await searchChannelCmd(ctx, server); })

// Private. Gathering server info
server.bot.command('delete', async (ctx: any) => { await deleteCmd(ctx, server); })
server.bot.command('ping', (ctx: any) => { pingCmd(ctx, server); })
server.bot.command('stats', async (ctx: any) => { await statsCmd(ctx, server); })
server.bot.command('echo', (ctx: any) => { echoCmd(ctx, server); })

// callback
server.bot.action(/.+/, async (ctx: any) => { await processCallback(ctx, server); })

// Handle all kinds of text.
server.bot.on('text', async (ctx: any) => {
  ctx.message.text = `/search ${ctx.message.text}`
  await searchCmd(ctx, server);
})
