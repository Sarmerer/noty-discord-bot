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

/**
 *
 * @param {string} text log text
 * @param {object} [options] logger options
 * @param {boolean} [options.error=false] if true, the log will be in red
 * @param {boolean} [options.warn=false] if true, the log will be in yellow
 * @param {boolean} [options.silent=false] if true, the log will not be sent to the logs channel
 */
function log(text, options) {
  if (options == null || typeof options !== 'object')
    options = {
      error: false,
      warn: false,
      silent: false,
    }

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

/**
 *
 * @param {string} errorText error text
 * @param {object} [options] logger options
 * @param {object} [options.origin=null] instance, where the error was thrown
 * @param {object} [options.origin.guild] discord guild where the error was thrown
 * @param {string} options.origin.guild.id guild id
 * @param {string} options.origin.guild.name guild name
 *
 * @param {boolean} [options.silent=true] if true, the log will not be sent to the logs channel
 */
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
