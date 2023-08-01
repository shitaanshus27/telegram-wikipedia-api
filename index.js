const express = require("express");
const app = express();
const axios = require("axios");
const PORT = process.env.PORT || 3000;

const TelegramBot = require("node-telegram-bot-api");
const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";

const TELEGRAM_BOT_TOKEN = "5804497723:AAEu9zpY3l5VU1fzqCh7qScfUTc6Bjks1gU";

app.use(express.json());

// Initialize Telegram Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

let flag = false;

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Check if this is the first message from the user (the "/start" command)
  if (msg.text === "Hi") {
    flag = true;
    const startMessage =
      `Hello! I am your Wikipedia Bot. You can use the following commands:\n\n` +
      `/start - Show this start message\n` +
      `/randomwiki - Get a random Wikipedia article along with the summary\n`;

    bot.sendMessage(chatId, startMessage);
  } else if (msg.text.toLowerCase() === "love++") {
    flag = true;
    const startMessage = `Thank You For Your Love`;
    bot.sendMessage(chatId, startMessage);
  }
});
// Express route to handle the /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  flag = true;
  let message =
    "Hello! I can post a random Wikipedia article to this group. Just use the /randomwiki command.";
  console.log(message);
  bot.sendMessage(chatId, message);
});

//Express route for handling the Telegram bot webhook
app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/randomwiki/, async (msg) => {
  const chatId = msg.chat.id;
  flag = true;
  try {
    const response = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        format: "json",
        action: "query",
        generator: "random",
        grnnamespace: 0,
        prop: "extracts",
        exintro: true,
        explaintext: true,
        exchars: 1000,
      },
    });
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    const title = page.title;
    const summary = page.extract;
    const message = `*${title}*\n\n${summary}`;
    console.log(message);
    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching data from Wikipedia API:", error.message);
    bot.sendMessage(
      chatId,
      "Oops! Something went wrong while fetching the Wikipedia article. Please try again later."
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
