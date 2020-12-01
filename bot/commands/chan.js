const { getChannelFromMention, respond, reply } = require("../utils");
const { prefix } = require("../config.json");
const { log } = require("../logger");

module.exports = {
  name: "chan",
  description: "set notifications channel",
  usage: `\`${prefix}chan <channel>\``,
  permissions: ["ADMINISTRATOR"],
  execute(message, args) {
    let guild = global.db.get("guilds").find({ id: message.guild.id }).value();
    if (!args.length) {
      let systemChanId = message.guild.systemChannelID;
      let text = !guild
        ? !systemChanId
          ? `There is no notifications channel for this server, set it with ${this.usage}, or ask server owner to do that`
          : `Current notifications channel is <#${systemChanId}>`
        : `Current notifications channel is <#${guild.channel}>`;
      text += `. State: ${guild && guild.muted ? "`muted`" : "`unmuted`"}`;
      return respond(message, text);
    }
    let hasPermission = message.guild.members.cache
      .get(message.author.id)
      .hasPermission(this.permissions);
    if (!hasPermission)
      return reply(
        message,
        "You don't have a permission for that :slight_frown:"
      );
    if (["mute", "unmute"].includes(args[0])) {
      respond(
        message,
        `Channel is now ${args[0] == "mute" ? "muted" : "unmuted"}`
      );
      return global.db
        .get("guilds")
        .find({ id: message.guild.id })
        .assign({ muted: args[0] == "mute" ? true : false })
        .write();
    }
    let chan = getChannelFromMention(message, args[0]);
    if (!chan) return reply(message, `Usage: ${this.usage}`);
    let chanExsits = global.db
      .get("guilds")
      .find({ id: chan.guild.id })
      .value();
    if (chanExsits) {
      global.db
        .get("guilds")
        .find({ id: chan.guild.id })
        .assign({ channel: chan.id })
        .write();
    } else {
      global.db
        .get("guilds")
        .push({ id: chan.guild.id, channel: chan.id, muted: false })
        .write();
    }
    respond(message, `New notifications channels is <#${chan.id}>`);
    log(
      `[${message.author.username}] set notifications channel on [${chan.guild.name}] to [${chan.name}]`
    );
  },
};
