const { MessageEmbed } = require("discord.js");
const { respond } = require("../utils/utils");

module.exports = {
  name: "list",
  description: "list users you stalk",
  execute(message, _) {
    let stalks = [];
    let targets = global.db
      .get("stalkers")
      .filter({ id: message.author.id })
      .value();
    if (!targets.length)
      return respond(message, `${message.author.username} not stalking anyone`);

    targets.forEach((t) => {
      let member = message.guild.members.cache.get(t.target);
      if (member) stalks.push(`<@${member.user.id}>`);
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
