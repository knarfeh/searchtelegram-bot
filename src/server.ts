import * as express from 'express'; /* ts-diable */
import * as elasticsearch from 'elasticsearch';
import * as redis from 'redis';
import { url } from './config/config';
const redsearch = require('redredisearch'); /* ts-diable */

const WEBHOOK_PATH = process.env.WEBHOOK_PATH;

export default class Server {
  public express: any;
  public bot: any;
  public redisClient: redis.RedisClient;
  public esClient: elasticsearch.Client;
  public redSearch: any;
  constructor(bot: any) {
    const server: express.Application = express();
    const redisClient = redis.createClient(parseInt(process.env.REDIS_PORT, 10), process.env.REDIS_HOST);
    const esClient = new elasticsearch.Client({
      host: process.env.ES_HOST_PORT,
    });
    redsearch.setClient(redisClient);

    console.log(`Settings webhook: ${url}${WEBHOOK_PATH}`)
    // bot.telegram.setWebhook(`${url}${WEBHOOK_PATH}`);
    bot.startWebhook(`/${WEBHOOK_PATH}`, null, 80);
    this.express = server;
    this.bot = bot;
    this.redisClient = redisClient;
    this.esClient = esClient;
    this.redSearch = redsearch
  }
}
