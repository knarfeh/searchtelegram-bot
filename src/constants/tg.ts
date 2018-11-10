export const emojiDict: { [key: string]: string; } = {
  bot: '🤖',
  channel: '🔊',
  group: '👥',
  people: '👤'
};

export const sigStr = `
By searchtelegram
🤖 @SearchTelegramdotcomBot Telegram indexing service
📢 @SearchTelegramChannel SearchTelegram updates
👥 @SearchTelegramGroup Public group of searchtelegram`;

export const searchItemPerPage = parseInt(process.env.SEARCH_ITEM_PER_PAGE || '3', 10);
export const collectionItemPerPage = parseInt(process.env.COLLECTION_ITEM_PER_PAGE || '10', 10);

export const noTgResponse = `😱 Sorry, but we don't find any result\n`;

export const resultLine = `----------------------------------------------------------`;
