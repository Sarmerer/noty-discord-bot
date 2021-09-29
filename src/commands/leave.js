const { client } = require('../client')
const { prefix } = require('#config').get('prefix', 'home_server')

const { respond, reply } = require('../utils')

module.exports = {
  name: 'leave',
  unlisted: true,
  needsArgs: true,
  permissions: ['owner'],
  description: 'leave a specific guild',
  usage: `Usage: \`${prefix}leave <guild id>\``,
  examples: {
    valid: [`${prefix}leave <guild id>`],
  },

  async execute(message, args) {
    const guild = await client.guilds.fetch(args[0])
    if (!guild)
      return reply(message, `Could not find guild with id \`${args[0]}\``)

    guild.leave()

    respond(message, `Left guild \`${guild.name}\` with id \`${args[0]}\``)
  },
}
