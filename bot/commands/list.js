const { MessageEmbed } = require("discord.js");
const { respond } = require("../utils");
const { client } = require("../client");
const { prefix } = require("../config.json");

module.exports = {
  name: "list",
  description: "list all users you stalk",
  usage: `Usage: \`${prefix}list\`.`,
  examples: {
    valid: [`${prefix}list`],
  },

  execute(message) {
    let stalks = [];
    let targets = global.db
      .get("stalkers")
      .filter({ id: message.author.id })
      .value();
    if (!targets.length)
      return respond(
        message,
        `${message.author.username} is not stalking anyone`
      );

    targets.forEach((t) => {
      if (t.guildID != message.guild.id) {
        let guild, member;
        guild = client.guilds.cache.get(t.guildID);
        if (guild) member = guild.members.cache.get(t.target);
        if (member)
          stalks.push(
            `${member.user.username}#${member.user.discriminator} on server ${guild.name}`
          );
        return;
      }
      let member = message.guild.members.cache.get(t.target);
      if (member)
        stalks.push(`${member.user.username}#${member.user.discriminator}`);
    });
    respond(
      message,
      new MessageEmbed()
        .setColor("#509624")
        .setAuthor(
          `${message.author.username} stalks:`,
          message.author.displayAvatarURL()
        )
        .setDescription(stalks.join("\n"))
    );
  },
};
