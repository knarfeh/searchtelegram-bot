import * as express from 'express';
import * as redis from 'redis';
import * as elasticsearch from 'elasticsearch';
// import redredisearch from 'redredisearch';
import { RedisClient } from 'redis';
import { Client } from 'elasticsearch';
import { url } from './config/config';

const redsearch = require('redredisearch');


const WEBHOOK_PATH = process.env.WEBHOOK_PATH;

export default class Server {
  express: any;
  bot: any;
  redisClient: RedisClient;
  esClient: Client;
  redSearch: any;
  constructor(bot: any) {
    const server: express.Application = express();
    const redisClient = redis.createClient(parseInt(process.env.REDIS_PORT), process.env.REDIS_HOST);
    const esClient = new elasticsearch.Client({
      host: process.env.ES_HOST_PORT,
    });
    redsearch.setClient(redisClient);


    bot.telegram.setWebhook(`${url}${WEBHOOK_PATH}`);
    bot.startWebhook(`/${WEBHOOK_PATH}`, null, 80);
    this.express = server;
    this.bot = bot;
    this.redisClient = redisClient;
    this.esClient = esClient;
    this.redSearch = redsearch
  }
}
