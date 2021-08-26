const {
  getMentionedUsers,
  reply,
  respond,
  getFlagValue,
  updateStat,
  getStalkersCount,
  getChannelFromMention,
  addGuildToDB,
} = require('../utils')
const config = require('#config').get('prefix', 'default_throttle')
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
      aliases: ['-m', '--mode'],
    },
    debounce: {
      default: 30,
      description:
        'set time (seconds), that should pass, before a next notification',
      aliases: ['-t', '--timeout', '--time'],
    },
    channel: {
      default: "system channel, or a channel set by server's owner",
      description: 'override default notifications channel',
      aliases: ['-c', '--chan', '--channel'],
    },
  },
  examples: {
    valid: [
      `${config.prefix}stalk @Sobuck -m offline dnd`,
      `${config.prefix}stalk @Bot @Bot1 @Bot2 -mode all -c #bots`,
      `${config.prefix}stalk @Someone`,
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
    } else {
      let guild = global.db
        .get('guilds')
        .find({ id: message?.guild?.id })
        .value()
      if (!guild) {
        guild = addGuildToDB(message.guild)
        log(
          `created guild record in db${
            message.guild?.name
              ? ` | On server: \`${message.guild?.name}\` - \`${message.guild?.id}\``
              : ''
          }`
        )
      }
      if (!guild?.channel) {
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
      channel = guild.channel
    }
    const notag = args.includes('notag')
    const dnd = args.includes('dnd')
    const d = new Date()
    const lastNotification = d.setSeconds(d.getSeconds() - debounce)
    let targets = []

    for (let member of members) {
      if (member.id == message.author.id) continue

      const alreadyStalking = global.db
        .get('stalkers')
        .find({ id: message.author.id, target: member.id })
        .value()

      let record = {
        id: message.author.id,
        target: member.id,
        guildID: message.guild.id,
        channel: channel,
        debounce: debounce,
        mode: mode,
        notag: notag,
        dnd: dnd,
        last_notification: lastNotification,
      }

      if (alreadyStalking) {
        global.db
          .get('stalkers')
          .find({ id: message.author.id, target: member.id })
          .assign(record)
          .write()
      } else {
        global.db.get('stalkers').push(record).write()
      }
      targets.push(member.username)
    }

    if (!targets.length)
      return reply(message, `you already stalk everyone you have mentioned`)

    const stalker = `\`${message.author.username}\``,
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
    const description = `${stalker} now stalks ${stalked} in <#${channel}> channel`
    const fields = [
      {
        name: 'Mode:',
        value: `\`${mode}\``,
        inline: true,
      },
      {
        name: 'DND:',
        value: `\`${dnd}\``,
        inline: true,
      },
      {
        name: 'No Tag',
        value: `\`${notag}\``,
        inline: true,
      },
    ]

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
