const { MessageEmbed } = require("discord.js");
const { respond } = require("../utils/utils");

module.exports = {
  name: "stalkers",
  description: "list your stalkers",
  execute(message, _) {
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
      let member = message.guild.members.cache.get(s.id);
      if (member) stalks.push(`<@${member.user.id}>`);
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
