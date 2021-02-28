const { home_server, home_server_logs_channel } = require("./config.json");
let logChannel = {};

function init(guildsCache) {
  let guild = guildsCache.get(home_server);
  if (!guild) return { error: "could not find home server" };
  logChannel = guild.channels.cache.get(home_server_logs_channel);
  if (!logChannel) return { error: "could not find logs channel" };
}

function log(text, options = { warn: false, error: false }) {
  console.log(text);
  let type = options.warn ? "fix" : options.error ? "diff" : "yaml";
  let pref = options.error ? "-" : "";
  logChannel.send(`\`\`\`${type}\n${pref + text}\n\`\`\``).catch(console.log);
}

module.exports = { initLogger: init, log: log };
