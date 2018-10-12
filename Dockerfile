FROM mhart/alpine-node:8.11

LABEL maintainer="knarfeh@outlook.com"

RUN mkdir -p /app/dist
COPY . /app/
WORKDIR /app

RUN npm install -g typescript@2.6 pm2@2.7.2 tslint yarn

ADD ./package.json .
ADD ./yarn.lock .
RUN yarn
RUN npm run build
RUN chmod 775 /app/bot.sh

CMD ["/app/bot.sh"]

# CMD ["node", "/app/dist/index.js"]
