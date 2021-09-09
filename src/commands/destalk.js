const {
  getMentionedUsers,
  reply,
  respond,
  updateStat,
  getStalkersCount,
  getFlagValue,
  getRoleFromMention,
} = require('../utils')
const config = require('#config').get('prefix', 'master_role')
const { log } = require('../logger')
const { client } = require('../client')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'destalk',
  description: 'stop stalking a user',
  usage: `Usage: \`${config.prefix}destalk @someone\`. Call \`${config.prefix}help destalk\` for more details.`,
  needsArgs: true,
  arguments: {
    required: ['@someone... - user(s)/bot(s) which you want to destalk'],
  },
  flags: {
    role: {
      description:
        'Unbind notifications from a role. Rrequires a user, that uses this flag, to have a role called "Stalk Master"',
      aliases: ['--role', '-r'],
    },
  },
  examples: {
    valid: [
      `${config.prefix}destalk @Sobuck`,
      `${config.prefix}destalk @Bot @Bot1 @Bot2`,
    ],
    invalid: [`${config.prefix}destalkSobuck`],
  },

  execute(message, _, flags) {
    let members = getMentionedUsers(message)
    if (!members.length) return reply(message, this.usage)

    const roleMention = getFlagValue(this.flags.role.aliases, flags)
    let role
    if (roleMention) {
      const hasPermission = message.member.permissions.has('MANAGE_ROLES')
      const hasRole = message.member.roles.cache.find(
        (r) => r.name === config.master_role
      )

      if (!hasPermission && !hasRole) {
        return reply(
          message,
          `you need to have either \`${config.master_role}\` role, or \`MANAGE_ROLE\` permission, in order to use \`--role\` flag`
        )
      }

      role = getRoleFromMention(message, roleMention)
      if (!role) {
        return reply(message, `role you have mentioned does not exist`)
      }
    }

    const stalkerID = role ? role.id : message.author.id
    let targets = []

    for (member of members) {
      const record = global.db
        .get('stalkers')
        .find({ id: stalkerID, target: member.id })
        .value()

      if (!record) continue

      targets.push(member.username)
      global.db
        .get('stalkers')
        .remove({ id: stalkerID, target: member.id })
        .write()
    }

    if (!targets.length)
      return reply(message, 'you have not been stalking anyone in the list')

    const stalker = role ? role.name : `\`${message.author.username}\``,
      last = targets.slice(-1),
      allButLast = targets.slice(0, -1).join('`, `'),
      stalked =
        targets.length <= 1
          ? `\`${targets.join('')}\``
          : `\`${allButLast}\` and \`${last}\``,
      guild = `\`${message?.guild?.name || undefined}\``

    const author = {
      name: 'Record removed',
      iconURL: client.user.displayAvatarURL(),
    }
    const description = `${stalker} (${
      role ? 'role' : 'user'
    }) not stalking ${stalked} anymore`

    const embed = new MessageEmbed({
      color: '#509624',
      author,
      description,
    })
    respond(message, { embeds: [embed] })

    updateStat('stalkers', getStalkersCount())
    log(`${stalker} has stopped stalking ${stalked} on server ${guild}`)
  },
}
