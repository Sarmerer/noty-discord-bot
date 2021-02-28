const { Client, Collection } = require("discord.js");
const client = new Client();
client.commands = new Collection();

module.exports = { client };
