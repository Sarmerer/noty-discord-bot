const {
  getMentionedUsers,
  reply,
  respond,
  getFlagValue,
  updateStat,
  getStalkersCount,
  getChannelFromMention,
  addGuildToDB,
  getRoleFromMention,
} = require('../utils')
const config = require('#config').get(
  'prefix',
  'default_throttle',
  'master_role'
)
const { log, logError } = require('../logger')
const { client } = require('../client')
const strings = require('../strings')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'stalk',
  description: 'start getting notifications, about user presence status',
  usage: `Usage: \`${config.prefix}stalk @someone\`. Call \`${config.prefix}help stalk\` for more details.`,
  needsArgs: true,
  arguments: {
    required: ['@someone... - user(s)/bot(s) which presence you want to stalk'],
    optional: [
      'dm - send notifications into direct messages',
      "dnd -  do not disturb mode, you won't be getting notifications when you are offline or dnd",
      "notag - no tag mode, bot won't tag you in notifications",
    ],
  },
  flags: {
    mode: {
      default: 'online',
      description: 'select notifications mode',
      header: 'variants: get notifications only when...',
      variants: {
        ooo: 'user goes online or offline',
        any: 'user goes to any status',
        offline: 'user goes offline',
        online: 'user goes online',
        idle: 'user goes idle',
        dnd: 'user goes dnd',
      },
      aliases: ['--mode', '-m'],
    },
    debounce: {
      default: 30,
      description:
        'set time (seconds), that should pass, before a next notification',
      aliases: ['--timeout', '--time', '-t'],
    },
    channel: {
      default: "system channel, or a channel set by server's owner",
      description: 'override default notifications channel',
      aliases: ['--channel', '--chan', '-c'],
    },
    role: {
      description:
        'requires a user, that uses this flag, to have a role called "Stalk Master". This flag defines a role, that will be tagged in notifications',
      aliases: ['--role', '-r'],
    },
  },
  examples: {
    valid: [
      `${config.prefix}stalk @Sobuck -m offline dnd`,
      `${config.prefix}stalk @Bot @Bot1 @Bot2 -mode all -c #bots`,
      `${config.prefix}stalk @Someone`,
      `${config.prefix}stalk @User --role @somerole`,
    ],
    invalid: [
      `${config.prefix}stalk Sobuck -m`,
      `${config.prefix}stalk @Bot,@Bot1 -mode all`,
      `${config.prefix}stalk @Someone -chnl not-exists`,
    ],
  },

  async execute(message, args, flags) {
    let members = getMentionedUsers(message)
    if (!members.length) return reply(message, this.usage)

    const mode = getFlagValue(this.flags.mode.aliases, flags, 'online')
    let modeVariants = Object.keys(this.flags.mode.variants)
    if (!modeVariants.includes(mode)) {
      let variants = modeVariants.join(', ')
      return reply(
        message,
        `mode \`${mode}\` is invalid, available modes: \`${variants}\``
      )
    }

    const debounce = Number.parseInt(
      getFlagValue(this.flags.debounce.aliases, flags, 30)
    )

    if (debounce < config.default_throttle)
      return reply(
        message,
        `timeout should be a number, and can't be less than ${config.default_throttle} seconds`
      )

    let guildCache = global.db
      .get('guilds')
      .find({ id: message?.guild?.id })
      .value()
    if (!guildCache) {
      guildCache = addGuildToDB(message.guild)
      log(
        `created guild record in db${
          message.guild?.name
            ? ` | On server: \`${message.guild?.name}\` - \`${message.guild?.id}\``
            : ''
        }`
      )
    }

    let channel
    const channelMention = getFlagValue(this.flags.channel.aliases, flags)
    if (channelMention) {
      let channelFromMention = await getChannelFromMention(
        message,
        channelMention
      )
      if (!channelFromMention)
        return reply(message, `channel you have mentioned does not exist`)
      channel = channelFromMention?.id
    } else if (guildCache?.channel) {
      channel = guildCache.channel
    } else {
      client.users
        .fetch(message.guild.ownerId)
        .then((user) => user.send(strings.channelMissing))
        .catch((error) => logError(error, { origin: message }))
      reply(
        message,
        'there is no notificaions channel on this server, use a `--channel` flag to override default channel'
      )
      return
    }

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

    const notag = args.includes('notag')
    const dnd = args.includes('dnd')
    const dm = args.includes('dm')
    const d = new Date()
    const lastNotification = d.setSeconds(d.getSeconds() - debounce)
    const stalkerID = role ? role.id : message.author.id
    let targets = []

    for (let member of members) {
      if (member.id == message.author.id) continue

      const alreadyStalking = global.db
        .get('stalkers')
        .find({ id: stalkerID, target: member.id })
        .value()

      let record = {
        id: stalkerID,
        notify: role ? 'role' : 'user',
        target: member.id,
        guildID: message.guild.id,
        channel: channel,
        debounce: debounce,
        mode: mode,
        notag: !dm && !role ? notag : false,
        dnd: !role ? dnd : false,
        dm: !role ? dm : false,
        last_notification: lastNotification,
      }

      if (alreadyStalking) {
        global.db
          .get('stalkers')
          .find({ id: stalkerID, target: member.id })
          .assign(record)
          .write()
      } else {
        global.db.get('stalkers').push(record).write()
      }

      targets.push(member.username)
    }

    if (!targets.length)
      return reply(message, `no suitable users were mentioned`)

    const stalker = role
        ? `\`${role.name}\` (role)`
        : `\`${message.author.username}\` (user)`,
      last = targets.slice(-1),
      allButLast = targets.slice(0, -1).join('`, `'),
      stalked =
        targets.length <= 1
          ? `\`${targets.join('')}\``
          : `\`${allButLast}\` and \`${last}\``
    server = `\`${message?.guild?.name || undefined}\``

    const author = {
      name: 'Record created',
      iconURL: client.user.displayAvatarURL(),
    }
    const description = `${stalker} now stalks ${stalked} in ${
      dm ? 'DM' : `<#${channel}> channel`
    }`
    const fields = [
      {
        name: 'Mode:',
        value: `\`${mode}\``,
        inline: true,
      },
    ]

    if (notag)
      fields.push({ name: 'No Tag', value: `\`${notag}\``, inline: true })
    if (dnd) fields.push({ name: 'DND:', value: `\`${dnd}\``, inline: true })
    if (dm) fields.push({ name: 'DM', value: `\`${dm}\``, inline: true })

    const embed = new MessageEmbed({
      color: '#509624',
      author,
      description,
      fields,
    })

    respond(message, { embeds: [embed] })

    updateStat('stalkers', getStalkersCount())
    log(`${stalker} now stalks ${stalked} on server ${server}`)
  },
}
