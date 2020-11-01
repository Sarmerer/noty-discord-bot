const { MessageEmbed } = require("discord.js");
const { respond } = require("../utils/utils");

module.exports = {
  name: "list",
  description: "list users you stalk",
  needAllGuilds: true,
  execute(message, guilds) {
    let stalks = [];
    let targets = global.db
      .get("stalkers")
      .filter({ id: message.author.id })
      .value();
    if (!targets.length)
      return respond(message, `${message.author.username} not stalking anyone`);

    targets.forEach((t) => {
      if (t.guildID != message.guild.id) {
        let guild, member;
        guild = guilds.cache.get(t.guildID);
        if (guild) member = guild.members.cache.get(t.target);
        if (member)
          stalks.push(
            `${member.user.username}#${member.user.discriminator} on server ${guild.name}`
          );
        return;
      }
      let member = message.guild.members.cache.get(t.target);
      if (member) stalks.push(`${member.user.id}#${member.user.discriminator}`);
    });
    respond(
      message,
      new MessageEmbed()
        .setColor("#0099ff")
        .setAuthor(
          `${message.author.username} stalks:`,
          message.author.displayAvatarURL()
        )
        .setDescription(stalks.join("\n"))
    );
  },
};
