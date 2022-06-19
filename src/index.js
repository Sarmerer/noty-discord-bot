const { Bot, BotConfig } = require("./types/bot");
const { LowdbNotyDatabase } = require("./repository/lowdb");
const path = require("node:path");
const { Intents } = require("discord.js");
const { Noty } = require("./types/models");

const config = BotConfig.fromFile("./config.json");
const noty = new Bot(config);
noty.addIntent(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS);

const dbPath = path.join(__dirname, "../db.json");
const db = LowdbNotyDatabase.fromFilePath(dbPath);
db.init();
noty.setDb(db);

noty.prepare().login();
