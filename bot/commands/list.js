const { MessageEmbed } = require("discord.js");
const { respond } = require("../utils");
const { logError } = require("../logger");
const { client } = require("../client");
const { prefix } = require("../config.json");

module.exports = {
  name: "list",
  description: "list all users you stalk",
  usage: `Usage: \`${prefix}list\`.`,
  examples: {
    valid: [`${prefix}list`],
  },

  async execute(message) {
    let stalks = [];
    let targets = global.db
      .get("stalkers")
      .filter({ id: message.author.id })
      .value();

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];

      const guild = await client.guilds
        .fetch(t.guildID)
        .catch((error) => logError(error, message));

      if (!guild) return;

      const member = await client.users
        .fetch(t.target)
        .catch((error) => logError(error, message));

      if (!member) return;

      stalks.push(
        t.guildID !== message.guild.id
          ? `${i + 1}. \`${member?.username}#${
              member?.discriminator
            }\` on server \`${guild?.name}\``
          : `${i + 1}. \`${member?.username}#${member?.discriminator}\``
      );
    }

    const author = {
      name: `${message.author.username} stalks:`,
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
