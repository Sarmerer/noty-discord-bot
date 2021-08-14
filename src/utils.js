const config = require('#config').get(
  'no_stats',
  'home_server_servers_stat',
  'home_server_stalkers_stat',
  'prefix',
  'ownerID'
)
const { client } = require('./client')
const { log, logError } = require('./logger')

module.exports = {
  parseMessage(message) {
    if (!message) return
    if (message.content.substring(0, config.prefix.length) !== config.prefix)
      return { command: '', args: [], flags: {} }
    const split = message.content.slice(config.prefix.length).trim().split(/ +/)
    let command = split.shift(),
      args = split,
      splicedArgs = [],
      flags = {}

    for (let i = 0; i < args.length; i++) {
      let a = args[i]
      if (a.match(/^-{1,2}\w+$/gim) && args[i + 1]) {
        flags[a.toLowerCase()] = args[i + 1].toLowerCase()
        i++
      } else {
        splicedArgs.push(a)
      }
    }
    args = splicedArgs

    return { args: args, command: command, flags: flags }
  },
  getMentionedUsers(message) {
    if (!message?.mentions?.members) return
    return message.mentions.members
      ? [...message.mentions.members.values()].map((m) => m.user)
      : []
  },

  async getChannelFromMention(message, mention) {
    if (!mention) return
    if (mention.startsWith('<#') && mention.endsWith('>')) {
      mention = mention.slice(2, -1)
      return await client.channels
        .fetch(mention)
        .catch((error) => logError(error, message))
    }
  },

  getStalkersCount() {
    return [
      ...new Set(
        global.db
          .get('stalkers')
          .value()
          .map((s) => s.id)
      ),
    ].length
  },

  getFlagValue(aliases, inputFlags, defaultValue = '') {
    let value = defaultValue
    aliases.forEach((a) => {
      if (inputFlags[a]) {
        value = inputFlags[a]
        return
      }
    })
    return value
  },

  /**
   * @param {('servers'|'stalkers')} name - name of a stat, that is being updated
   * @param {any} newValue - new value of a selected stat
   */
  async updateStat(name, newValue) {
    if (config.no_stats) return

    const allowedStats = ['servers', 'stalkers']

    if (!allowedStats.includes(name))
      return log(`tried to update invalid stat: ${name}`, { warn: true })

    const chanID =
      name === 'servers'
        ? config.home_server_servers_stat
        : config.home_server_stalkers_stat
    const channel = client.channels
      .fetch(chanID)
      .catch(() =>
        logError(`failed to find stat channel with id \`${chanID}\``)
      )

    if (!channel)
      return log(`channel for ${name} stat does not exisits`, { warn: true })

    channel.edit({ name: `${name}: ${newValue}` }).catch(logError)
  },

  reply(message, content, timeout = 10000) {
    message
      .reply(content)
      .then((reply) =>
        setTimeout(() => {
          if (reply.deletable) reply.delete()
        }, timeout)
      )
      .catch((error) => logError(error, message))
  },

  respond(message, content) {
    return message.channel
      .send(content)
      .catch((error) => logError(error, message))
  },

  async directMessage(recipient, messageText) {
    try {
      const user = await client.users.fetch(recipient)
      if (!user) return
      user.send(messageText)
    } catch (error) {
      logError(error)
    }
  },

  addGuildToDB(guild) {
    if (!guild) return undefined
    const collection = global.db.get('guilds')
    collection
      .push({
        id: guild.id,
        channel: guild.systemChannelId || '',
        muted: false,
      })
      .write()
    return collection.find({ id: guild.id }).value()
  },

  hasPermissions(handler, message) {
    if (!handler?.permissions?.length) return true

    if (
      handler.permissions.includes('owner') &&
      message?.author?.id !== config.ownerID
    )
      return false

    if (!message.member.permissions.has(handler.permissions)) return false
    return true
  },
}
