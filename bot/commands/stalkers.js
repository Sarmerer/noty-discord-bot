const { MessageEmbed } = require("discord.js");
const { respond } = require("../utils");
const { client } = require("../client");
const { prefix } = require("../config.json");
const { logError } = require("../logger");

module.exports = {
  name: "stalkers",
  description: "list people that stalk you",
  usage: `Usage: \`${prefix}stalkers\`.`,
  examples: {
    valid: [`${prefix}stalkers`],
  },

  async execute(message) {
    let stalks = [];
    let stalkers = global.db
      .get("stalkers")
      .filter({ target: message.author.id })
      .value();

    for (let i = 0; i < stalkers.length; i++) {
      const s = stalkers[i];

      const guild = await client.guilds
        .fetch(s.guildID)
        .catch((error) => logError(error, message));

      if (!guild) return;

      const member = await client.users
        .fetch(s.id)
        .catch((error) => logError(error, message));

      if (!member) return;

      stalks.push(
        s.guildID != message.guild.id
          ? `${i + 1}. \`${member?.username}#${
              member?.discriminator
            }\` on server \`${guild?.name}\``
          : `${i + 1}. \`${member?.username}#${member?.discriminator}\``
      );
    }

    const author = {
      name: `${message.author.username} is being stalked by:`,
      iconURL: message.author.displayAvatarURL(),
    };
    const description = stalks.length > 0 ? stalks.join("\n") : "Noone";

    const embed = new MessageEmbed({
      color: "#509624",
      author,
      description,
    });

    respond(message, { embeds: [embed] });
  },
};
