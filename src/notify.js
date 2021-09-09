const default_throttle = require('#config').get('default_throttle')
const strings = require('./strings')
const { log, logError } = require('./logger')
const { flags } = require('./commands/stalk')
const { directMessage } = require('./utils')
const { client } = require('./client')

const statusVariants = Object.keys(flags.mode.variants)

function shouldNotify(mode = 'online', oldPresence, newPresence) {
  const conds = {
    ooo: (o, n) => n != o && (n == 'offline' || n == 'online'),
    offline: (o, n) => o != 'offline' && n == 'offline',
    online: (o, n) => o != 'online' && n == 'online',
    idle: (o, n) => o != 'idle' && n == 'idle',
    dnd: (o, n) => o != 'dnd' && n == 'dnd',
    any: (o, n) => o != n,
  }

  const fn = conds[mode]
  if (typeof fn !== 'function') return false
  return fn(oldPresence, newPresence)
}

const notify = async (oldPresence, newPresence) => {
  if (!statusVariants.includes(newPresence.status)) return
  if (!oldPresence?.status) oldPresence = { status: 'offline' }

  const stalkers = filterStalkers(newPresence)
  if (!stalkers.length) return

  const target = await client.users
    .fetch(newPresence.userId)
    .catch((error) => logError(error, { origin: newPresence }))
  if (!target) return

  for (const s of stalkers) {
    const stalker =
      !s.notify || s.notify == 'user'
        ? await newPresence.guild.members.fetch(s.id).catch((error) => {
            if (error.httpStatus != 404)
              logError(error, { origin: newPresence })
          })
        : null

    if (!s.notify || s.notify == 'user') {
      if (!stalker) continue // TODO delete stalk record from database

      const stalkerStatus = stalker.presence?.status
      if (s.dnd && (stalkerStatus === 'offline' || stalkerStatus === 'dnd'))
        continue
    }

    if (!shouldNotify(s.mode, oldPresence?.status, newPresence.status)) continue

    const guildInDB = global.db.get('guilds').find({ id: s.guildID }).value()
    if (!guildInDB)
      return directMessage(
        newPresence.guild.ownerID,
        strings.couldNotSendANotification
      )

    global.db
      .get('stalkers')
      .find({ id: s.id, target: s.target })
      .assign({ last_notification: new Date() })
      .write()

    const text = `${
      s.notag ? '' : `<@${s.notify == 'role' ? '&' : ''}${s.id}>, `
    }${target.username} just went \`${newPresence.status}\`${
      s.dm ? ` in \`${newPresence.guild.name}\` guild` : ''
    }`

    const channel = s.dm
      ? stalker
      : await getNotificaionChannel(s.channel, guildInDB.channel)

    if (!channel)
      return directMessage(newPresence.guild.ownerId, strings.channelMissing)

    channel.send(text).catch((error) => {
      if (error.code == 50001)
        // Missing Access error
        return directMessage(newPresence.guild.ownerId, strings.missingAccess)

      return logError(error, { origin: newPresence })
    })
  }
}

function filterStalkers(newPresence) {
  let stalkers = global.db
    .get('stalkers')
    .filter(
      (s) =>
        s.target === newPresence.userId && newPresence.guild.id === s.guildID
    )
    .value()
  if (!stalkers.length) return []

  stalkers = stalkers.filter((s) => {
    const dateDiff = new Date() - new Date(s.last_notification)
    const debounce = (s.debounce || default_throttle) * 1000
    return dateDiff >= debounce
  })

  return stalkers
}

async function getNotificaionChannel(channelID, defaultChannelID) {
  if (!channelID && !defaultChannelID) return

  let channel = await client.channels.fetch(channelID).catch((error) => {
    if (error?.httpStatus != 404) logError(error)
  })

  if (!channel) {
    channel = await client.channels.fetch(defaultChannelID).catch((error) => {
      if (error?.httpStatus != 404) logError(error)
    })
  }
  return channel
}

module.exports = { notify }
