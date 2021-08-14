const { MessageEmbed } = require('discord.js')
const { respond } = require('../utils')
const { client } = require('../client')
const prefix = require('#config').get('prefix')

module.exports = {
  name: 'clear',
  unlisted: true,
  permissions: ['owner'],
  description: 'leave guilds with no stalkers',
  usage: `Usage: \`${prefix}clear\``,
  examples: {
    valid: [`${prefix}clear`],
  },

  execute(message) {
    const guilds = global.db.get('guilds').map('id').value()
    const stalkersGuilds = new Set(
      global.db.get('stalkers').map('guildID').value()
    )

    for (const id of guilds) {
      if (!stalkersGuilds.has(id)) console.log(id)
      // global.db.get(guilds).remove({ id });
    }
  },
}
