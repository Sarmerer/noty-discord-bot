const { MessageEmbed } = require("discord.js");
const { respond } = require("../utils/utils");

module.exports = {
  name: "stalkers",
  description: "list your stalkers",
  needAllGuilds: true,
  execute(message, guilds) {
    let stalks = [];
    let stalkers = global.db
      .get("stalkers")
      .filter({ target: message.author.id })
      .value();
    if (!stalkers.length)
      return respond(
        message,
        `${message.author.username} is not being stalked by anyone`
      );
    stalkers.forEach((s) => {
      if (s.guildID != message.guild.id) {
        let guild, member;
        guild = guilds.cache.get(s.guildID);
        if (guild) member = guild.members.cache.get(s.id);
        if (member)
          stalks.push(
            `${member.user.username}#${member.user.discriminator} on server ${guild.name}`
          );
        return;
      }
      let member = message.guild.members.cache.get(s.id);
      if (member)
        stalks.push(`${member.user.username}#${member.user.discriminator}`);
    });
    respond(
      message,
      new MessageEmbed()
        .setColor("#0099ff")
        .setAuthor(
          `${message.author.username} is being stalked by:`,
          message.author.displayAvatarURL()
        )
        .setDescription(stalks.join("\n"))
    );
  },
};
