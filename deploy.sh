#!/usr/bin/env sh
set -e

npm run docs:build

cd docs/.vuepress/dist

echo 'docs.searchtelegram.com' > CNAME

git init
git add -A
git config --global user.email "hejun1874@gmail.com"
git config --global user.name "knarfeh"
git commit -m 'deploy'

git push -f git@github.com:knarfeh/searchtelegram-bot.git master:gh-pages

cd -
