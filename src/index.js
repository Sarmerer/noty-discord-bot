// Load dependencies
const { client } = require('./client')

const {
  reply,
  updateStat,
  parseMessage,
  getStalkersCount,
  addGuildToDB,
  hasPermissions,
} = require('./utils')
const { initLogger, log, logError } = require('./logger')
const { notify } = require('./notify')
const strings = require('./strings')

// Load config
const config = require('#config').get('prefix', 'token')

// Init database
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./src/stalkers.json')
global.db = lowdb(adapter)
global.db.defaults({ stalkers: [], guilds: [] }).write()

// console.info('[db]', 'Using', use_firebase ? 'Firebase' : 'LowDB')
// const db = require('../db')
// console.log(db)

// Load commads
const fs = require('fs')
const commandFiles = fs
  .readdirSync('./src/commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command)
}

client.once('ready', async () => {
  client.user.setActivity(`${config.prefix}help`, {
    type: 'LISTENING',
  })

  console.info('[logger] is', config.no_logs ? 'disabled' : 'enabled')
  let error = await initLogger()
  if (error?.error) {
    throw new Error(error.error)
  }
  log(`\`${client.user.username}\` is up and running!`)
})
client.on('warn', (warn) => log(warn, { warn: true }))
client.on('error', logError)

client.on('messageCreate', (message) => {
  if (message.author.bot || !message.guild) return

  let { command, args, flags } = parseMessage(message)
  if (!client.commands.has(command)) return

  let handler = client.commands.get(command)

  if (!hasPermissions(handler, message))
    return reply(message, 'You are not allowed to use that.')
  if (handler.needsArgs && !args.length && handler.usage)
    return reply(message, handler.usage)

  try {
    handler.execute(message, args, flags)
  } catch (error) {
    reply(message, strings.commandExecError)
    logError(error, message)
  }
})

client.on('presenceUpdate', (op = { status: 'offline' }, np) => notify(op, np))

client.on('guildCreate', (guild) => {
  addGuildToDB(guild)
  client.users
    .fetch(guild.ownerId)
    .then((user) => user.send(strings.thankYou))
    .catch(logError)

  updateStat('servers', client.guilds.cache.size)
  log(`joined \`${guild.name}\``)
})

client.on('guildDelete', (guild) => {
  global.db.get('guilds').remove({ id: guild.id }).write()
  global.db
    .get('stalkers')
    .remove((s) => s.guildID === guild.id)
    .write()

  updateStat('servers', client.guilds.cache.size)
  log(`left \`${guild.name}\``)
})

client.on('guildMemberRemove', (member) => {
  global.db
    .get('stalkers')
    .remove(
      (s) =>
        (s.id == member.user.id || s.target == member.user.id) &&
        s.guildId == member.guild.id
    )
    .write()

  updateStat('stalkers', getStalkersCount())
})

client.login(config.token)
