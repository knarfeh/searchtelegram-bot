---
sidebar: auto
---

<p align="center">
    <img src="https://i.imgur.com/pSaH62t.png" alt="SearchTelegram" width="100">
</p>
<h1 align="center" class="logo">Search Telegram</h1>

> 搜索，管理 Telegram 上的群组，频道，机器人。

# [@SearchTelegramdotcomBot](https://t.me/SearchTelegramdotcomBot)
## 命令
### 搜索

#### `/search`

搜索所有群组，频道，机器人：

![search_golang_cmd](https://i.imgur.com/cVxNY7t.png)
目前默认的对话是进行搜索操作：
![search_golang_directly](https://i.imgur.com/eMmxPYE.png)

#### `/sbot`

只搜索机器人：

![sbot_python](https://i.imgur.com/hbbjHVj.png)

如果不加参数进入交互式搜索，之后15秒内的对话会只搜索机器人：

![sbot_python_stage](https://i.imgur.com/3IKyRzq.png)

以下的 sgroup 命令，schannel 命令同理。

#### `/sgroup`

只搜索群组：

![sgroup_python_stage](https://i.imgur.com/47kGCQp.png)

#### `/schannel`

只搜索频道：

![schannel_python_stage](https://i.imgur.com/ub3iZ4n.png)

### 资源操作

#### `/get`

获取详细信息，可以进行点赞，收藏等操作： 

![get_python](https://i.imgur.com/QMVTr5A.png)

#### `/submit`

提交一个未建立索引的频道，群组或机器人： 

![submit_python](https://i.imgur.com/ugEkWui.png)

### 设置
#### `/lang`

点击按钮设置语言，目前支持简体中文，英文：

![lang_cmd](https://i.imgur.com/4rnYFTN.png)

### 发现
#### `/tags`

根据标签进行搜索：

![tags_cmd](https://i.imgur.com/zQDf1Qj.png)

### 其他

#### `/start` & `/help`

获取帮助信息。

#### 按照标签搜索

![search_with_tags](https://i.imgur.com/zjzXxBC.png)

#### 按照标签搜索机器人

![search_with_tags_bot](https://i.imgur.com/66Gj59I.png)

## 实现细节

### 编程语言/框架

* [Golang](https://golang.org/)
* [Node.js](http://nodejs.org)
* [telegraf](http://telegraf.js.org)

### 开源软件

* [Elasticsearch](https://www.elastic.co/products/elasticsearch)
* [Redis](https://redis.io/)
* [redisearch](https://oss.redislabs.com/redisearch/)

## 致谢

* [telegraf/telegraf](https://github.com/telegraf/telegraf)
* [wfjsw/osiris-groupindexer](https://github.com/wfjsw/osiris-groupindexer)
* [vuepress](https://vuepress.vuejs.org/)
