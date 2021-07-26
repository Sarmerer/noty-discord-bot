const {
  getMentionedUsers,
  reply,
  respond,
  updateStat,
  getStalkersCount,
} = require("../utils");
const { prefix } = require("../config.json");
const { log } = require("../logger");
const { client } = require("../client");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "destalk",
  description: "stop stalking a user",
  usage: `Usage: \`${prefix}destalk @someone\`. Call \`${prefix}help destalk\` for more details.`,
  arguments: {
    required: ["@someone... - user(s)/bot(s) which you want to destalk"],
  },
  examples: {
    valid: [`${prefix}destalk @Sobuck`, `${prefix}destalk @Bot @Bot1 @Bot2`],
    invalid: [`${prefix}destalkSobuck`],
  },

  execute(message) {
    let members = getMentionedUsers(message);
    if (!members.length) return reply(message, this.usage);

    let targets = [];

    for (member of members) {
      const record = global.db
        .get("stalkers")
        .find({ id: message.author.id, target: member.id })
        .value();

      if (!record) continue;

      targets.push(member.username);
      global.db
        .get("stalkers")
        .remove({ id: message.author.id, target: member.id })
        .write();
    }

    if (!targets.length)
      return reply(message, "you have not been stalking anyone in the list");

    const stalker = `\`${message.author.username}\``,
      last = targets.slice(-1),
      allButLast = targets.slice(0, -1).join("`, `"),
      stalked =
        targets.length <= 1
          ? `\`${targets.join("")}\``
          : `\`${allButLast}\` and \`${last}\``,
      guild = `\`${message?.guild?.name || undefined}\``;

    const author = {
      name: "Record removed",
      iconURL: client.user.displayAvatarURL(),
    };
    const description = `${stalker} not stalking ${stalked} anymore`;

    const embed = new MessageEmbed({
      color: "#509624",
      author,
      description,
    });
    respond(message, { embeds: [embed] });

    updateStat("stalkers", getStalkersCount());
    log(`${stalker} has stopped stalking ${stalked} on server ${guild}`);
  },
};
