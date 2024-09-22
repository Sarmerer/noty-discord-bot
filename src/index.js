const { Bot, BotConfig } = require('./types/bot')
const { LowdbNotyDatabase } = require('./repository/lowdb')
const path = require('node:path')
const { GatewayIntentBits } = require('discord.js')

const config = BotConfig.fromFile('./config.json')
const noty = new Bot(config)
noty.addIntent(GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers)

const dbPath = path.join(__dirname, '../db.json')
const db = LowdbNotyDatabase.fromFilePath(dbPath)
db.init()
noty.setDb(db)

noty.prepare().login()
