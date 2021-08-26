const { Client, Collection } = require('discord.js')
const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES'],
})
client.commands = new Collection()

module.exports = { client }
