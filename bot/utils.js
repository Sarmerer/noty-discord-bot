const {
  no_stats,
  home_server,
  home_server_servers_stat,
  home_server_stalkers_stat,
  prefix,
} = require("./config.json");
const { client } = require("./client");
const { log } = require("./logger");

module.exports = {
  parseMessage(message) {
    if (!message) return;
    if (message.content.substring(0, prefix.length) !== prefix)
      return { command: "", args: [], flags: {} };
    const split = message.content.slice(prefix.length).trim().split(/ +/);
    let command = split.shift(),
      args = split,
      splicedArgs = [],
      flags = {};

    for (let i = 0; i < args.length; i++) {
      let a = args[i];
      if (a.match(/^-{1,2}\w+$/gim) && args[i + 1]) {
        flags[a.toLowerCase()] = args[i + 1].toLowerCase();
        i++;
      } else {
        splicedArgs.push(a);
      }
    }
    args = splicedArgs;

    return { args: args, command: command, flags: flags };
  },
  getMentionedUsers(message) {
    if (!message?.mentions?.members) return;
    return message.mentions.members
      ? [...message.mentions.members.values()].map((m) => m.user)
      : [];
  },

  getChannelFromMention(message, mention) {
    if (!mention) return;
    if (mention.startsWith("<#") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);
      return message.guild.channels.cache.get(mention);
    }
  },

  getStalkersCount() {
    return [
      ...new Set(
        global.db
          .get("stalkers")
          .value()
          .map((s) => s.id)
      ),
    ].length;
  },

  getFlagValue(aliases, inputFlags, defaultValue = "") {
    let value = defaultValue;
    aliases.forEach((a) => {
      if (inputFlags[a]) {
        value = inputFlags[a];
        return;
      }
    });
    return value;
  },

  /**
   * @param {('servers'|'stalkers')} name - name of a stat, that is being updated
   * @param {any} newValue - new value of a selected stat
   */
  updateStat(name, newValue) {
    if (no_stats) return;

    let guild, channel;
    const allowedStats = ["servers", "stalkers"];

    if (!allowedStats.includes(name))
      return log(`tried to update invalid stat: ${name}`, { warn: true });

    guild = client.guilds.cache.get(home_server);
    if (!guild) return log(`home server does not exist`, { warn: true });

    channel = guild.channels.cache.get(
      name === "servers" ? home_server_servers_stat : home_server_stalkers_stat
    );

    if (!channel)
      return log(`channel for ${name} stat does not exisits`, { warn: true });

    channel
      .edit({ name: `${name}: ${newValue}` })
      .catch((error) => log(error, { error: true }));
  },

  reply(message, text, timeout = 5000) {
    message
      .reply(text)
      .then((reply) => reply.delete({ timeout: timeout }))
      .catch((error) =>
        log(
          `Error: ${error}${
            mention?.guild?.name
              ? ` | On server: [${ng?.name} - ${ng?.id}]`
              : ""
          }`,
          {
            error: true,
          }
        )
      );
  },

  respond(message, text) {
    return message.channel.send(text).catch((error) =>
      log(
        `Error: ${error}${
          message?.guild?.name ? ` | On server: [${ng?.name} - ${ng?.id}]` : ""
        }`,
        {
          error: true,
        }
      )
    );
  },

  addGuildToDB(guild) {
    if (!guild) return undefined;
    const collection = global.db.get("guilds");
    collection
      .push({
        id: guild.id,
        channel: guild.systemChannelID || "",
        muted: false,
      })
      .write();
    return collection.find({ id: guild.id }).value();
  },
};
