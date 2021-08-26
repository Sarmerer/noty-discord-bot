const config = require('#config').get('home_server_logs_channel', 'no_logs')
const { client } = require('./client')

let logChannel

async function init() {
  if (config.no_logs) return
  logChannel = await client.channels
    .fetch(config.home_server_logs_channel)
    .catch(console.error)
  if (!logChannel) return { error: 'could not find logs channel' }
}

function log(text, options = { warn: false, error: false, silent: false }) {
  const esc = text?.replace?.(/`/gm, '')
  if (esc) {
    if (options.error) console.error(esc)
    else if (options.warn) console.warn(esc)
    else console.log(esc)
  }
  if (config.no_logs || options?.silent) return
  const type = options.warn ? 'fix' : options.error ? 'diff' : ''
  const defaultType = !options.warn && !options.error
  const prefix = options.error ? '-' : ''
  logChannel
    .send(
      `${defaultType ? '' : '```'}${type}\n${prefix + text}\n${
        defaultType ? '' : '```'
      }`
    )
    .catch(console.log)
}

function logError(errorText, options = { origin: null, silent: true }) {
  log(
    `${errorText}${
      options?.origin?.guild?.name
        ? ` | On server: [${options?.origin?.guild?.name} - ${options?.origin?.guild?.id}]`
        : ''
    }`,
    { error: true, silent: !!options?.silent }
  )
}

module.exports = { initLogger: init, log, logError }
